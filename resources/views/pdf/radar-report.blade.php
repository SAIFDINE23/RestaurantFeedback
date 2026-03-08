<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport Radar IA Pro - {{ $company->name }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10pt;
            line-height: 1.6;
            color: #1f2937;
        }
        
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 30px;
            margin-bottom: 30px;
            border-radius: 10px;
        }
        
        .header h1 {
            font-size: 28pt;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            font-size: 12pt;
            opacity: 0.9;
        }
        
        .badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: bold;
            margin-top: 10px;
        }
        
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 16pt;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 3px solid #4f46e5;
        }
        
        .kpi-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        
        .kpi-row {
            display: table-row;
        }
        
        .kpi-card {
            display: table-cell;
            width: 25%;
            padding: 15px;
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            text-align: center;
            margin-right: 10px;
        }
        
        .kpi-label {
            font-size: 9pt;
            color: #6b7280;
            margin-bottom: 5px;
        }
        
        .kpi-value {
            font-size: 24pt;
            font-weight: bold;
            color: #1f2937;
        }
        
        .executive-summary {
            background: #fef3c7;
            padding: 20px;
            border-left: 5px solid #f59e0b;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .executive-summary h3 {
            color: #92400e;
            font-size: 14pt;
            margin-bottom: 10px;
        }
        
        .insight-box {
            background: #dbeafe;
            padding: 15px;
            border-left: 4px solid #3b82f6;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        
        .insight-title {
            font-weight: bold;
            color: #1e40af;
            font-size: 11pt;
            margin-bottom: 5px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 9pt;
        }
        
        th {
            background: #4f46e5;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }
        
        td {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .signal-card {
            background: #fff7ed;
            border: 2px solid #fed7aa;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
        }
        
        .signal-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .signal-title {
            font-weight: bold;
            font-size: 11pt;
            color: #92400e;
        }
        
        .severity-badge {
            background: #dc2626;
            color: white;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 8pt;
            font-weight: bold;
        }
        
        .severity-badge.medium {
            background: #f59e0b;
        }
        
        .severity-badge.low {
            background: #10b981;
        }
        
        .action-card {
            background: #f0fdf4;
            border: 2px solid #bbf7d0;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
        }
        
        .priority-badge {
            background: #dc2626;
            color: white;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 8pt;
            font-weight: bold;
            margin-bottom: 8px;
            display: inline-block;
        }
        
        .priority-badge.p1 {
            background: #f59e0b;
        }
        
        .priority-badge.p2 {
            background: #3b82f6;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            font-size: 8pt;
            color: #6b7280;
            text-align: center;
        }
        
        .roi-box {
            background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
        }
        
        .roi-value {
            font-size: 36pt;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .health-score {
            text-align: center;
            padding: 20px;
            background: #f0fdf4;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .health-score-value {
            font-size: 48pt;
            font-weight: bold;
            color: #10b981;
        }
        
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <!-- En-tête -->
    <div class="header">
        <h1>🧠 Radar IA Pro</h1>
        <div class="subtitle">Rapport d'Intelligence Décisionnelle</div>
        <div class="subtitle">{{ $company->name }}</div>
        <span class="badge">CONFIDENTIEL - PLAN PRO</span>
    </div>

    <!-- Informations du rapport -->
    <div style="text-align: right; margin-bottom: 20px; color: #6b7280; font-size: 9pt;">
        <strong>Période analysée:</strong> {{ $data['period']['from'] }} → {{ $data['period']['to'] }}<br>
        <strong>Généré le:</strong> {{ $generated_at }}<br>
        <strong>Confiance:</strong> {{ $data['analysis']['confidence'] ?? '—' }}
    </div>

    <!-- KPIs Principaux -->
    <div class="section">
        <h2 class="section-title">📊 Indicateurs Clés de Performance</h2>
        <div class="kpi-grid">
            <div class="kpi-row">
                <div class="kpi-card">
                    <div class="kpi-label">Feedbacks Analysés</div>
                    <div class="kpi-value" style="color: #3b82f6;">{{ $data['stats']['total'] }}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Taux Positif</div>
                    <div class="kpi-value" style="color: #10b981;">{{ number_format($data['stats']['positiveRate'], 1) }}%</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Taux Négatif</div>
                    <div class="kpi-value" style="color: #dc2626;">{{ number_format($data['stats']['negativeRate'], 1) }}%</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Note Moyenne</div>
                    <div class="kpi-value" style="color: #f59e0b;">{{ number_format($data['stats']['avgRating'] ?? 0, 1) }}/5</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Health Score -->
    <div class="health-score">
        <div style="font-size: 14pt; color: #059669; font-weight: bold; margin-bottom: 10px;">Health Score Global</div>
        <div class="health-score-value">{{ $data['healthScore']['score'] }}/100</div>
        <div style="margin-top: 10px; font-size: 9pt; color: #6b7280;">
            @if($data['healthScore']['score'] >= 80)
                ✅ Excellente santé - Continuez votre stratégie actuelle
            @elseif($data['healthScore']['score'] >= 60)
                📊 Performance correcte - Opportunités d'optimisation identifiées
            @else
                ⚠️ Attention requise - Actions correctives recommandées
            @endif
        </div>
    </div>

    <!-- Résumé Exécutif -->
    <div class="section">
        <h2 class="section-title">📝 Résumé Exécutif</h2>
        <div class="executive-summary">
            <h3>Synthèse Orientée Décision</h3>
            <p style="line-height: 1.8;">{{ $data['analysis']['summary'] ?? 'Analyse en cours...' }}</p>
        </div>
    </div>

    <!-- ROI et Impact Business -->
    <div class="roi-box">
        <div style="font-size: 14pt; margin-bottom: 10px;">💰 Valeur du Radar IA Pro</div>
        <div style="font-size: 12pt; opacity: 0.9; margin-bottom: 5px;">Économie Potentielle Mensuelle</div>
        <div class="roi-value">{{ number_format($data['stats']['negative'] * 45) }}€</div>
        <div style="font-size: 9pt; opacity: 0.8; margin-top: 10px;">
            Basé sur {{ $data['stats']['negative'] }} clients insatisfaits × 45€ de valeur client moyenne<br>
            <strong>ROI du Plan Pro: {{ number_format((($data['stats']['negative'] * 45) / 59) * 100, 0) }}% par mois</strong>
        </div>
    </div>

    <div class="page-break"></div>

    <!-- Tendances vs Période Précédente -->
    <div class="section">
        <h2 class="section-title">📈 Analyse des Tendances</h2>
        <table>
            <thead>
                <tr>
                    <th>Métrique</th>
                    <th>Actuel</th>
                    <th>Précédent</th>
                    <th>Évolution</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Taux Positif</strong></td>
                    <td>{{ number_format($data['trends']['positiveRate']['current'], 1) }}%</td>
                    <td>{{ number_format($data['trends']['positiveRate']['previous'], 1) }}%</td>
                    @php $color1 = $data['trends']['positiveRate']['delta'] >= 0 ? '#10b981' : '#dc2626'; @endphp
                    <td style="color: <?php echo $color1; ?>; font-weight: bold;">
                        {{ $data['trends']['positiveRate']['delta'] >= 0 ? '+' : '' }}{{ number_format($data['trends']['positiveRate']['delta'], 1) }}%
                    </td>
                </tr>
                <tr>
                    <td><strong>Taux Négatif</strong></td>
                    <td>{{ number_format($data['trends']['negativeRate']['current'], 1) }}%</td>
                    <td>{{ number_format($data['trends']['negativeRate']['previous'], 1) }}%</td>
                    @php $color2 = $data['trends']['negativeRate']['delta'] <= 0 ? '#10b981' : '#dc2626'; @endphp
                    <td style="color: <?php echo $color2; ?>; font-weight: bold;">
                        {{ $data['trends']['negativeRate']['delta'] >= 0 ? '+' : '' }}{{ number_format($data['trends']['negativeRate']['delta'], 1) }}%
                    </td>
                </tr>
                <tr>
                    <td><strong>Taux de Réponse</strong></td>
                    <td>{{ number_format($data['trends']['responseRate']['current'], 1) }}%</td>
                    <td>{{ number_format($data['trends']['responseRate']['previous'], 1) }}%</td>
                    @php $color3 = $data['trends']['responseRate']['delta'] >= 0 ? '#10b981' : '#dc2626'; @endphp
                    <td style="color: <?php echo $color3; ?>; font-weight: bold;">
                        {{ $data['trends']['responseRate']['delta'] >= 0 ? '+' : '' }}{{ number_format($data['trends']['responseRate']['delta'], 1) }}%
                    </td>
                </tr>
                <tr>
                    <td><strong>Note Moyenne</strong></td>
                    <td>{{ number_format($data['trends']['avgRating']['current'] ?? 0, 2) }}</td>
                    <td>{{ number_format($data['trends']['avgRating']['previous'] ?? 0, 2) }}</td>
                    @php $color4 = ($data['trends']['avgRating']['delta'] ?? 0) >= 0 ? '#10b981' : '#dc2626'; @endphp
                    <td style="color: <?php echo $color4; ?>; font-weight: bold;">
                        {{ ($data['trends']['avgRating']['delta'] ?? 0) >= 0 ? '+' : '' }}{{ number_format($data['trends']['avgRating']['delta'] ?? 0, 2) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Signaux Détectés -->
    @if(count($data['signals']) > 0)
    <div class="section">
        <h2 class="section-title">🚨 Signaux Critiques Détectés</h2>
        @foreach($data['signals'] as $signal)
        <div class="signal-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div class="signal-title">{{ $signal['title'] }}</div>
                <span class="severity-badge {{ strtolower($signal['severity'] ?? 'high') }}">
                    {{ strtoupper($signal['severity'] ?? 'HIGH') }}
                </span>
            </div>
            <div style="color: #6b7280; font-size: 9pt; margin-bottom: 8px;">
                <strong>Catégorie:</strong> {{ strtoupper($signal['category'] ?? 'N/A') }}
            </div>
            <p style="margin-bottom: 10px;">{{ $signal['detail'] }}</p>
            @if(!empty($signal['evidence']) && is_array($signal['evidence']))
            <div style="background: white; padding: 10px; border-radius: 5px; margin-top: 10px;">
                <strong style="font-size: 9pt; color: #6b7280;">Exemples de Feedbacks:</strong>
                <ul style="margin-top: 5px; margin-left: 20px; font-size: 9pt; color: #374151;">
                    @foreach(array_slice($signal['evidence'], 0, 3) as $evidence)
                    <li style="margin-bottom: 5px;">"{{ $evidence }}"</li>
                    @endforeach
                </ul>
            </div>
            @endif
        </div>
        @endforeach
    </div>
    @endif

    <div class="page-break"></div>

    <!-- Actions Recommandées -->
    @if(count($data['recommendedActions']) > 0)
    <div class="section">
        <h2 class="section-title">🎯 Plan d'Actions Recommandées</h2>
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <strong style="color: #1e40af;">💡 Note de l'Expert:</strong>
            <p style="margin-top: 5px; font-size: 9pt; color: #1e3a8a;">
                Les actions ci-dessous sont priorisées selon leur impact business potentiel. 
                Commencez par les actions P0 (haute priorité) pour obtenir des résultats rapides et mesurables.
            </p>
        </div>
        
        @foreach($data['recommendedActions'] as $action)
        <div class="action-card">
            <span class="priority-badge {{ strtolower($action['priority'] ?? 'p2') }}">
                {{ $action['priority'] ?? 'P2' }} - 
                @if(($action['priority'] ?? '') === 'P0')
                    URGENT
                @elseif(($action['priority'] ?? '') === 'P1')
                    IMPORTANT
                @else
                    À PLANIFIER
                @endif
            </span>
            <div style="font-weight: bold; font-size: 11pt; color: #166534; margin-bottom: 8px;">
                {{ $action['title'] }}
            </div>
            <p style="color: #374151; margin-bottom: 10px;">{{ $action['detail'] }}</p>
            
            @if(!empty($action['context']))
            <div style="background: white; padding: 10px; border-radius: 5px; font-size: 9pt; color: #6b7280;">
                <strong>Contexte:</strong><br>
                @if(!empty($action['context']['signal_title']))
                    <strong>Signal:</strong> {{ $action['context']['signal_title'] }}<br>
                @endif
                @if(!empty($action['context']['signal_detail']))
                    <strong>Détail:</strong> {{ $action['context']['signal_detail'] }}
                @endif
            </div>
            @endif
        </div>
        @endforeach
    </div>
    @endif

    <!-- Benchmarks -->
    <div class="section">
        <h2 class="section-title">🏆 Benchmarks Sectoriels</h2>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <strong style="color: #92400e;">📊 Comparaison Anonyme:</strong>
            <p style="margin-top: 5px; font-size: 9pt; color: #78350f;">
                Votre performance comparée à la médiane des restaurants de votre catégorie.
            </p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Métrique</th>
                    <th>Votre Score</th>
                    <th>Médiane Secteur</th>
                    <th>Percentile</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['benchmarks'] as $benchmark)
                <tr>
                    <td><strong>{{ $benchmark['label'] }}</strong></td>
                    <td>{{ $benchmark['company'] ?? '—' }}</td>
                    <td>{{ $benchmark['median'] ?? '—' }}</td>
                    <td>
                        @if($benchmark['percentile'] !== null)
                            @php 
                                $color5 = $benchmark['percentile'] >= 75 ? '#10b981' : ($benchmark['percentile'] >= 50 ? '#f59e0b' : '#dc2626');
                            @endphp
                            <strong style="color: <?php echo $color5; ?>">
                                {{ $benchmark['percentile'] }}%
                            </strong>
                        @else
                            —
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Insights Stratégiques -->
    <div class="section">
        <h2 class="section-title">💡 Insights Stratégiques Pro</h2>
        
        <div class="insight-box" style="background: #dcfce7; border-color: #10b981;">
            <div class="insight-title" style="color: #065f46;">✅ Points Forts Identifiés</div>
            <ul style="margin-left: 20px; margin-top: 5px;">
                @if($data['stats']['positiveRate'] > 70)
                <li>Excellent taux de satisfaction ({{ number_format($data['stats']['positiveRate'], 1) }}%)</li>
                @endif
                @if($data['stats']['responseRate'] > 70)
                <li>Forte réactivité avec {{ number_format($data['stats']['responseRate'], 1) }}% de taux de réponse</li>
                @endif
                @if($data['healthScore']['score'] > 75)
                <li>Health Score solide indiquant une bonne santé opérationnelle</li>
                @endif
                @if(count($data['signals']) < 3)
                <li>Peu de signaux critiques détectés - stabilité opérationnelle</li>
                @endif
            </ul>
        </div>

        <div class="insight-box" style="background: #fee2e2; border-color: #dc2626;">
            <div class="insight-title" style="color: #991b1b;">⚠️ Axes d'Amélioration Prioritaires</div>
            <ul style="margin-left: 20px; margin-top: 5px;">
                @if($data['stats']['negativeRate'] > 20)
                <li><strong>Urgent:</strong> Taux de feedbacks négatifs élevé ({{ number_format($data['stats']['negativeRate'], 1) }}%) - Risque de perte de clients</li>
                @endif
                @if($data['stats']['responseRate'] < 50)
                <li><strong>Important:</strong> Taux de réponse faible ({{ number_format($data['stats']['responseRate'], 1) }}%) - Opportunités manquées</li>
                @endif
                @if($data['trends']['negativeRate']['delta'] > 5)
                <li><strong>Alerte:</strong> Tendance à la hausse des feedbacks négatifs (+{{ number_format($data['trends']['negativeRate']['delta'], 1) }}%)</li>
                @endif
                @if(count($data['signals']) > 5)
                <li><strong>Action requise:</strong> {{ count($data['signals']) }} signaux critiques détectés nécessitant une attention immédiate</li>
                @endif
            </ul>
        </div>

        <div class="insight-box" style="background: #e0e7ff; border-color: #4f46e5;">
            <div class="insight-title" style="color: #3730a3;">🎯 Recommandations Stratégiques</div>
            <ol style="margin-left: 20px; margin-top: 5px;">
                <li><strong>Court terme (0-30 jours):</strong> Traitez les {{ count(array_filter($data['recommendedActions'], fn($a) => ($a['priority'] ?? '') === 'P0')) }} actions P0 pour résoudre les problèmes urgents</li>
                <li><strong>Moyen terme (30-90 jours):</strong> Implémentez les améliorations P1 pour optimiser l'expérience client</li>
                <li><strong>Long terme (90+ jours):</strong> Planifiez les initiatives P2 pour maintenir votre avantage concurrentiel</li>
            </ol>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p><strong>Rapport Confidentiel - {{ $company->name }}</strong></p>
        <p>Généré par Feedora Radar IA Pro le {{ $generated_at }}</p>
        <p style="margin-top: 10px;">
            Ce rapport contient des analyses stratégiques confidentielles basées sur l'intelligence artificielle.<br>
            Pour toute question, contactez notre équipe support à support@feedora.fr
        </p>
        <p style="margin-top: 10px; color: #9ca3af;">
            © {{ date('Y') }} Feedora - Tous droits réservés
        </p>
    </div>
</body>
</html>
