<?php

namespace App\Services;

use App\Models\RadarAnalysis;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RadarAnalysisService
{
	/**
	 * Analyse globale (admin plateforme) avec cache.
	 * Stocke les analyses globales dans radar_analyses avec company_id = NULL.
	 */
	public function analyzeGlobalWithCache(
		array $feedbacks,
		array $sentimentStats = [],
		int $feedbacksWithComments = 0,
		array $context = [],
		bool $force = false
	): array {
		if (empty($feedbacks)) {
			return $this->fallbackGlobalAnalysis($sentimentStats, $context, 'Aucun feedback à analyser pour le moment.');
		}

		$feedbackHash = $this->generateFeedbackHash($feedbacks);

		if (! $force) {
			$cachedAnalysis = RadarAnalysis::query()
				->whereNull('company_id')
				->where('feedback_hash', $feedbackHash)
				->latest('analyzed_at')
				->first();

			$cachedStatus = $cachedAnalysis?->analysis_data['status'] ?? null;

			// Ne jamais figer une analyse fallback en cache :
			// si Gemini revient, on régénère automatiquement.
			if ($cachedAnalysis && $cachedStatus !== 'fallback') {
				return array_merge(
					$cachedAnalysis->analysis_data,
					[
						'cached' => true,
						'cached_at' => $cachedAnalysis->analyzed_at->format('Y-m-d H:i'),
						'feedbacks_cached_count' => $cachedAnalysis->feedbacks_count,
					]
				);
			}
		}

		$analysis = $this->analyzeGlobal($feedbacks, $sentimentStats, $context);

		if (($analysis['status'] ?? null) !== 'fallback') {
			RadarAnalysis::create([
				'company_id' => null,
				'feedback_hash' => $feedbackHash,
				'feedbacks_count' => count($feedbacks),
				'feedbacks_with_comments' => $feedbacksWithComments,
				'analysis_data' => $analysis,
				'analyzed_at' => now(),
			]);
		}

		return array_merge($analysis, ['cached' => false, 'forced' => $force]);
	}

	/**
	 * Analyser les feedbacks avec cache intelligent
	 * 
	 * @param int $companyId - ID de la compagnie
	 * @param array $feedbacks - Liste des feedbacks à analyser
	 * @param array $sentimentStats - Stats de sentiment
	 * @param int $feedbacksWithComments - Nombre de feedbacks avec commentaires
	 * @return array - Analyse (du cache ou nouvellement générée)
	 */
	public function analyzeWithCache(int $companyId, array $feedbacks, array $sentimentStats = [], int $feedbacksWithComments = 0): array
	{
		if (empty($feedbacks)) {
			return $this->fallbackAnalysis($feedbacks, $sentimentStats, 'Aucun feedback à analyser pour le moment.');
		}

		// 1️⃣ Générer le hash des feedbacks actuels
		$feedbackHash = $this->generateFeedbackHash($feedbacks);

		// 2️⃣ Chercher une analyse existante avec le même hash
		$cachedAnalysis = RadarAnalysis::where('company_id', $companyId)
			->where('feedback_hash', $feedbackHash)
			->latest('analyzed_at')
			->first();

		$cachedStatus = $cachedAnalysis?->analysis_data['status'] ?? null;

		// 3️⃣ Si trouvée et exploitable, retourner le cache avec metadata
		// On ignore volontairement les analyses fallback pour permettre une
		// récupération automatique dès que Gemini refonctionne.
		if ($cachedAnalysis && $cachedStatus !== 'fallback') {
			return array_merge(
				$cachedAnalysis->analysis_data,
				[
					'cached' => true,
					'cached_at' => $cachedAnalysis->analyzed_at->format('Y-m-d H:i'),
					'feedbacks_cached_count' => $cachedAnalysis->feedbacks_count,
				]
			);
		}

		// 4️⃣ Sinon, générer une nouvelle analyse
		$analysis = $this->analyze($feedbacks, $sentimentStats);

		// 5️⃣ Sauvegarder uniquement les analyses IA réussies
		if (($analysis['status'] ?? null) !== 'fallback') {
			RadarAnalysis::create([
				'company_id' => $companyId,
				'feedback_hash' => $feedbackHash,
				'feedbacks_count' => count($feedbacks),
				'feedbacks_with_comments' => $feedbacksWithComments,
				'analysis_data' => $analysis,
				'analyzed_at' => now(),
			]);
		}

		return array_merge($analysis, ['cached' => false]);
	}

	/**
	 * Générer un hash SHA256 des feedback IDs
	 * Ceci détecte si les feedbacks ont changé
	 */
	private function generateFeedbackHash(array $feedbacks): string
	{
		$ids = collect($feedbacks)
			->pluck('id')
			->sort()
			->implode(',');

		return hash('sha256', $ids);
	}

	/**
	 * Analyse IA dédiée au scope global.
	 * Retourne un format structuré: signals + recommended_actions.
	 */
	public function analyzeGlobal(array $feedbacks, array $sentimentStats = [], array $context = []): array
	{
		if (empty($feedbacks)) {
			return $this->fallbackGlobalAnalysis($sentimentStats, $context, 'Aucun feedback à analyser pour le moment.');
		}

		$prompt = $this->buildGlobalPrompt($feedbacks, $sentimentStats, $context);

		try {
			$apiKey = config('services.gemini.api_key');
			$model = config('services.gemini.model') ?? 'models/gemini-2.5-flash:generateContent';

			if (! $apiKey) {
				return $this->fallbackGlobalAnalysis($sentimentStats, $context, 'Clé Gemini absente, analyse locale utilisée.');
			}

			$url = 'https://generativelanguage.googleapis.com/v1beta/' . $model
				. '?key=' . urlencode($apiKey);

			$response = Http::timeout(30)
				->retry(2, 500)
				->post($url, [
				'contents' => [
					[
						'parts' => [
							['text' => $prompt],
						],
					],
				],
			]);

			if (! $response->successful()) {
				Log::warning('RadarIA global Gemini API error', [
					'status' => $response->status(),
					'body' => mb_substr($response->body(), 0, 1000),
				]);
				return $this->fallbackGlobalAnalysis($sentimentStats, $context, 'Erreur Gemini API, analyse locale utilisée.');
			}

			$text = $response->json('candidates.0.content.parts.0.text');
			$parsed = $this->extractJson($text);

			if (! $parsed) {
				return $this->fallbackGlobalAnalysis($sentimentStats, $context, 'Réponse IA non exploitable, analyse locale utilisée.');
			}

			$signals = is_array($parsed['signals'] ?? null) ? $parsed['signals'] : [];
			$actions = is_array($parsed['recommended_actions'] ?? null) ? $parsed['recommended_actions'] : [];

			return [
				'status' => 'ok',
				'scope' => 'global',
				'summary' => $parsed['summary'] ?? 'Analyse IA globale disponible.',
				'signals' => $signals,
				'recommended_actions' => $actions,
				'confidence' => $parsed['confidence'] ?? 'moyenne',
				'context' => $context,
				'model' => $model,
				'note' => $parsed['note'] ?? null,
			];
		} catch (\Throwable $e) {
			Log::warning('RadarIA global Gemini exception', [
				'error' => $e->getMessage(),
			]);
			return $this->fallbackGlobalAnalysis($sentimentStats, $context, 'Exception IA, analyse locale utilisée.');
		}
	}

	private function buildGlobalPrompt(array $feedbacks, array $sentimentStats, array $context): string
	{
		$entries = collect($feedbacks)
			->take(180)
			->map(function ($f, $index) {
				$rating = $f['rating'] ?? 'N/A';
				$comment = trim($f['comment'] ?? '');
				$comment = $this->maskPii($comment);
				$comment = mb_substr($comment, 0, 600);
				return ($index + 1) . ") Note: {$rating}/5 | Commentaire: {$comment}";
			})
			->implode("\n");

		$sentimentLine = ! empty($sentimentStats)
			? "Sentiment: positif={$sentimentStats['positive']}, neutre={$sentimentStats['neutral']}, negatif={$sentimentStats['negative']}."
			: '';

		$kpis = $context['kpis'] ?? [];
		$ops = $context['ops'] ?? [];
		$period = $context['period'] ?? [];

		$periodLine = (! empty($period['from']) && ! empty($period['to']))
			? "Période: {$period['from']} → {$period['to']}."
			: '';

		$kpisLine = ! empty($kpis)
			? 'KPIs: ' . json_encode($kpis, JSON_UNESCAPED_UNICODE)
			: '';

		$opsLine = ! empty($ops)
			? 'Ops: ' . json_encode($ops, JSON_UNESCAPED_UNICODE)
			: '';

		return <<<PROMPT
Tu es un analyste produit senior (SaaS B2B) chargé d'un Radar IA GLOBAL (multi-entreprises).

Objectif: produire des INSIGHTS actionnables et différenciants.

Règles:
- Répondre uniquement en JSON valide.
- Ne pas inventer de données. Utiliser uniquement les KPIs/Ops fournis + les feedbacks.
- Ne pas inclure de données personnelles (emails, téléphones). Les commentaires sont déjà masqués.
- Style: concis, professionnel, orienté décisions.

Format JSON attendu:
{
  "summary": "...",
  "signals": [
    {"category": "risk|opportunity|ops", "title": "...", "detail": "...", "severity": "low|medium|high", "evidence_count": 0}
  ],
  "recommended_actions": [
    {"title": "...", "detail": "...", "priority": "P0|P1|P2"}
  ],
  "confidence": "faible|moyenne|haute",
  "note": "..."
}

$periodLine
$sentimentLine
$kpisLine
$opsLine

Feedbacks (échantillon):
$entries
PROMPT;
	}

	private function fallbackGlobalAnalysis(array $sentimentStats, array $context, string $note): array
	{
		$ops = $context['ops'] ?? [];
		$signals = [];

		if (! empty($sentimentStats)) {
			$total = ($sentimentStats['positive'] ?? 0) + ($sentimentStats['neutral'] ?? 0) + ($sentimentStats['negative'] ?? 0);
			if ($total > 0) {
				$negRate = round((($sentimentStats['negative'] ?? 0) / $total) * 100, 1);
				if ($negRate >= 25) {
					$signals[] = [
						'category' => 'risk',
						'title' => 'Hausse de feedbacks négatifs',
						'detail' => "Taux négatif estimé: {$negRate}%.",
						'severity' => $negRate >= 40 ? 'high' : 'medium',
						'evidence_count' => $sentimentStats['negative'] ?? 0,
					];
				}
			}
		}

		$failed = (int) ($ops['failed_requests_30d'] ?? 0);
		if ($failed > 0) {
			$signals[] = [
				'category' => 'ops',
				'title' => 'Échecs d’envoi détectés',
				'detail' => "{$failed} demandes en statut failed sur la période.",
				'severity' => $failed >= 25 ? 'high' : 'medium',
				'evidence_count' => $failed,
			];
		}

		return [
			'status' => 'fallback',
			'scope' => 'global',
			'summary' => 'Radar global: tendances calculées localement à partir des KPIs et signaux visibles.',
			'signals' => $signals,
			'recommended_actions' => [
				[
					'title' => 'Prioriser les signaux à fort impact',
					'detail' => 'Traiter d’abord les risques et les incidents ops (P0), puis les opportunités.',
					'priority' => 'P1',
				],
			],
			'confidence' => 'faible',
			'context' => $context,
			'model' => null,
			'note' => $note,
		];
	}

	private function maskPii(string $text): string
	{
		if ($text === '') {
			return $text;
		}

		// Emails
		$text = preg_replace('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', '[email]', $text);

		// Phone numbers (simple heuristic)
		$text = preg_replace('/\+?[0-9][0-9\s().-]{7,}[0-9]/', '[phone]', $text);

		return $text;
	}

	/**
	 * Analyser sans cache (appel direct API)
	 */
	public function analyze(array $feedbacks, array $sentimentStats = []): array
	{
		if (empty($feedbacks)) {
			return $this->fallbackAnalysis($feedbacks, $sentimentStats, 'Aucun feedback à analyser pour le moment.');
		}

		$prompt = $this->buildPrompt($feedbacks, $sentimentStats);

		try {
			$apiKey = config('services.gemini.api_key');
			$model = config('services.gemini.model') ?? 'models/gemini-2.5-flash:generateContent';

			if (! $apiKey) {
				return $this->fallbackAnalysis($feedbacks, $sentimentStats, 'Clé Gemini absente, analyse locale utilisée.');
			}

			$url = 'https://generativelanguage.googleapis.com/v1beta/' . $model
				. '?key=' . urlencode($apiKey);

			$response = Http::timeout(30)
				->retry(2, 500)
				->post($url, [
				'contents' => [
					[
						'parts' => [
							['text' => $prompt],
						],
					],
				],
			]);

			if (! $response->successful()) {
				Log::warning('RadarIA company Gemini API error', [
					'status' => $response->status(),
					'body' => mb_substr($response->body(), 0, 1000),
					'feedbacks_count' => count($feedbacks),
				]);
				return $this->fallbackAnalysis($feedbacks, $sentimentStats, 'Erreur Gemini API, analyse locale utilisée.');
			}

			$text = $response->json('candidates.0.content.parts.0.text');
			$parsed = $this->extractJson($text);

			if (! $parsed) {
				return $this->fallbackAnalysis($feedbacks, $sentimentStats, 'Réponse IA non exploitable, analyse locale utilisée.');
			}

			return [
				'status' => 'ok',
				'summary' => $parsed['summary'] ?? 'Analyse IA disponible.',
				'keyIssues' => $parsed['key_issues'] ?? [],
				'positiveDrivers' => $parsed['positive_drivers'] ?? [],
				'recommendations' => $parsed['recommendations'] ?? [],
				'confidence' => $parsed['confidence'] ?? 'moyenne',
				'model' => $model,
				'note' => $parsed['note'] ?? null,
			];
		} catch (\Throwable $e) {
			Log::warning('RadarIA company Gemini exception', [
				'error' => $e->getMessage(),
				'feedbacks_count' => count($feedbacks),
			]);
			return $this->fallbackAnalysis($feedbacks, $sentimentStats, 'Exception IA, analyse locale utilisée.');
		}
	}

	private function buildPrompt(array $feedbacks, array $sentimentStats): string
	{
		$entries = collect($feedbacks)
			->take(120)
			->map(function ($f, $index) {
				$id = $f['id'] ?? '?';
				$rating = $f['rating'] ?? 'N/A';
				$comment = trim($f['comment'] ?? '');
				$comment = mb_substr($comment, 0, 600);
				return ($index + 1) . ") [ID:{$id}] Note: {$rating}/5 | Commentaire: {$comment}";
			})
			->implode("\n");

		$sentimentLine = ! empty($sentimentStats)
			? "Stats sentiment: positif={$sentimentStats['positive']}, neutre={$sentimentStats['neutral']}, negatif={$sentimentStats['negative']}."
			: '';

				return <<<PROMPT
Tu es un analyste CX senior. Analyse les feedbacks clients suivants pour produire une liste des PROBLÈMES À RÉSOUDRE.

Objectif: identifier uniquement les problèmes majeurs (pas de résumé général, pas de points positifs, pas de recommandations).

Contraintes:
- Répondre uniquement en JSON valide.
- Ne pas inventer de données.
- Utiliser un ton professionnel et concis.
- Se concentrer sur les problèmes concrets et actionnables.
- Pour chaque problème, indiquer les IDs des feedbacks qui le mentionnent (champ feedback_ids).

Format JSON attendu:
{
	"key_issues": [
		{"title": "...", "detail": "...", "count": 0, "impact": "faible|moyen|fort", "feedback_ids": [1, 2, 3]}
	],
	"confidence": "faible|moyenne|haute",
	"note": "..."
}

$sentimentLine

Feedbacks:
$entries
PROMPT;
	}

	private function extractJson(?string $text): ?array
	{
		if (! $text) {
			return null;
		}

		$start = strpos($text, '{');
		$end = strrpos($text, '}');

		if ($start === false || $end === false || $end <= $start) {
			return null;
		}

		$json = substr($text, $start, $end - $start + 1);
		$decoded = json_decode($json, true);

		return json_last_error() === JSON_ERROR_NONE ? $decoded : null;
	}

	private function fallbackAnalysis(array $feedbacks, array $sentimentStats, string $note): array
	{
		$issues = $this->extractTopKeywords($feedbacks, 6);

		return [
			'status' => 'fallback',
			'summary' => 'Analyse rapide basée sur les tendances les plus fréquentes dans les commentaires.',
			'keyIssues' => $issues,
			'positiveDrivers' => [],
			'recommendations' => [
				'Prioriser les problèmes les plus cités et communiquer un plan d’action.',
				'Suivre l’évolution mensuelle des notes et de la satisfaction.',
			],
			'confidence' => 'faible',
			'model' => null,
			'note' => $note,
		];
	}

	private function extractTopKeywords(array $feedbacks, int $limit = 5): array
	{
		$negative = collect($feedbacks)->filter(function ($f) {
			$rating = $f['rating'] ?? null;
			return $rating !== null && (int) $rating <= 2;
		})->values();

		$source = $negative->isNotEmpty() ? $negative : collect($feedbacks);

		$stopwords = [
			'avec','pour','dans','tout','mais','plus','moins','tres','très','etre','être','avoir','cela','cette',
			'nous','vous','leur','leurs','mon','ma','mes','ton','ta','tes','son','sa','ses','notre','votre','comme',
			'sur','sous','entre','ainsi','donc','alors','car','parce','ceci','cela','ici','là','trop','bien','pas',
			'que','qui','quoi','dont','quand','comment','où','oui','non','est','sont','avait','vais','fait','faire',
			'service','application','plateforme','produit','client','clients','été','etait','était','gentil','aimé',
			'aime','aimée','mere','mère','super','parfait','excellent','sympa','merci','bonjour','soir','tres','très'
		];

		$text = $source
			->pluck('comment')
			->filter()
			->implode(' ');

		if ($text === '') {
			return [];
		}

		$text = mb_strtolower($text);
		$text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);
		$words = preg_split('/\s+/', $text);

		$counts = [];
		foreach ($words as $word) {
			if (mb_strlen($word) < 4) {
				continue;
			}
			if (in_array($word, $stopwords, true)) {
				continue;
			}
			$counts[$word] = ($counts[$word] ?? 0) + 1;
		}

		arsort($counts);
		$top = array_slice($counts, 0, $limit, true);

		return collect($top)->map(function ($count, $word) {
			return [
				'title' => ucfirst($word),
				'detail' => 'Mention fréquente dans les commentaires.',
				'count' => $count,
				'impact' => $count >= 5 ? 'fort' : ($count >= 3 ? 'moyen' : 'faible'),
			];
		})->values()->all();
	}
}
