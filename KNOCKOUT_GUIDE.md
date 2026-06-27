# Guia: Atualizar Times do Mata-Mata

## Arquivo para editar

`data/matches.json`

## Como atualizar quando um time é definido

Quando o classificado for definido, ache o jogo pelo `"id"` e:

1. Troque `"home"` e/ou `"away"` pelo nome **em inglês** (exatamente como aparece na lista TEAMS do app.js)
2. Quando **ambos** os times estiverem definidos, troque `"placeholder": true` para `"placeholder": false`
3. Enquanto **um dos lados** ainda for placeholder (ex: "Group X 3rd Place"), mantenha `"placeholder": true`

### Nomes dos times (usar exatamente assim)

| Nome no JSON | Exibido no site |
|---|---|
| `South Africa` | 🇿🇦 África do Sul |
| `Algeria` | 🇩🇿 Argélia |
| `Argentina` | 🇦🇷 Argentina |
| `Australia` | 🇦🇺 Austrália |
| `Austria` | 🇦🇹 Áustria |
| `Belgium` | 🇧🇪 Bélgica |
| `Bosnia and Herzegovina` | 🇧🇦 Bósnia |
| `Brazil` | 🇧🇷 Brasil |
| `Cabo Verde` | 🇨🇻 Cabo Verde |
| `Canada` | 🇨🇦 Canadá |
| `Colombia` | 🇨🇴 Colômbia |
| `Congo DR` | 🇨🇩 RD Congo |
| `Côte d'Ivoire` | 🇨🇮 Costa do Marfim |
| `Croatia` | 🇭🇷 Croácia |
| `Curaçao` | 🇨🇼 Curaçao |
| `Czechia` | 🇨🇿 Tchéquia |
| `Ecuador` | 🇪🇨 Equador |
| `Egypt` | 🇪🇬 Egito |
| `England` | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra |
| `France` | 🇫🇷 França |
| `Germany` | 🇩🇪 Alemanha |
| `Ghana` | 🇬🇭 Gana |
| `Haiti` | 🇭🇹 Haiti |
| `Iran` | 🇮🇷 Irã |
| `Iraq` | 🇮🇶 Iraque |
| `Japan` | 🇯🇵 Japão |
| `Jordan` | 🇯🇴 Jordânia |
| `Korea Republic` | 🇰🇷 Coreia do Sul |
| `Mexico` | 🇲🇽 México |
| `Morocco` | 🇲🇦 Marrocos |
| `Netherlands` | 🇳🇱 Holanda |
| `New Zealand` | 🇳🇿 Nova Zelândia |
| `Norway` | 🇳🇴 Noruega |
| `Panama` | 🇵🇦 Panamá |
| `Paraguay` | 🇵🇾 Paraguai |
| `Portugal` | 🇵🇹 Portugal |
| `Qatar` | 🇶🇦 Catar |
| `Saudi Arabia` | 🇸🇦 Arábia Saudita |
| `Scotland` | 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia |
| `Senegal` | 🇸🇳 Senegal |
| `South Africa` | 🇿🇦 África do Sul |
| `Spain` | 🇪🇸 Espanha |
| `Sweden` | 🇸🇪 Suécia |
| `Switzerland` | 🇨🇭 Suíça |
| `Türkiye` | 🇹🇷 Turquia |
| `Tunisia` | 🇹🇳 Tunísia |
| `United States` | 🇺🇸 Estados Unidos |
| `Uruguay` | 🇺🇾 Uruguai |
| `Uzbekistan` | 🇺🇿 Uzbequistão |

---

## Status atual dos jogos do mata-mata

### ✅ Rodada de 32 — Times confirmados (já atualizados)

| Jogo | Casa | Fora | Data (BRT) |
|------|------|------|------------|
| 73 | South Africa | Canada | 28/jun 16:00 |
| 76 | Brazil | Japan | 29/jun 14:00 |
| 74 | Germany | Paraguay | 29/jun 17:30 |
| 75 | Netherlands | Morocco | 29/jun 22:00 |
| 78 | Côte d'Ivoire | Norway | 30/jun 14:00 |
| 77 | France | Sweden | 30/jun 18:00 |
| 81 | United States | Bosnia and Herzegovina | 01/jul 21:00 |
| 88 | Australia | Egypt | 03/jul 15:00 |
| 86 | Argentina | Cabo Verde | 03/jul 19:00 |

### ⏳ Rodada de 32 — Falta definir (placeholder = true)

| Jogo | Casa | Fora (falta) | Data (BRT) | O que falta |
|------|------|--------------|------------|-------------|
| 79 | **Mexico** ✅ | Group C/E/F/H/I 3rd Place | 30/jun 22:00 | 3º lugar (depende dos resultados hoje) |
| 80 | Group L Winner | Group E/H/I/J/K 3rd Place | 01/jul 13:00 | 1º do Grupo L + 3º lugar |
| 82 | **Belgium** ✅ | Group A/E/H/I/J 3rd Place | 01/jul 17:00 | 3º lugar |
| 84 | **Spain** ✅ | Group J Runner-up | 02/jul 16:00 | 2º do Grupo J (define hoje) |
| 83 | Group K Runner-up | Group L Runner-up | 02/jul 20:00 | 2º Grupo K + 2º Grupo L (define hoje) |
| 85 | **Switzerland** ✅ | Group E/F/G/I/J 3rd Place | 03/jul 00:00 | 3º lugar |
| 87 | Group K Winner | Group D/E/I/J/L 3rd Place | 03/jul 22:30 | 1º Grupo K + 3º lugar |

### Quando atualizar cada um

- **Jogos 80, 83, 84, 87**: Os grupos J, K, L terminam **hoje (27/jun)**. Após os resultados, você saberá 1º, 2º de cada grupo.
- **Jogos 79, 82, 85**: Os 3ºs colocados são definidos após **todas** as fases de grupo terminarem (hoje). A FIFA publica a tabela de melhores 3ºs.
- **Jogo 80**: Precisa do 1º do Grupo L (hoje à noite).

### Exemplo de edição

Quando souber que o 2º do Grupo J é a Jordânia, edite o jogo 84:

```json
{
  "id": 84,
  "stage": "Round of 32",
  "group": null,
  "home": "Spain",
  "away": "Jordan",          ← troque aqui
  "kickoff": "2026-07-02T19:00:00Z",
  "venue": "SoFi Stadium",
  "city": "Los Angeles",
  "placeholder": false        ← mude para false
}
```

### ⏳ Oitavas, Quartas, Semi, Final

Esses jogos usam "Match X Winner" / "Match X Loser" como placeholder. Quando o vencedor de um jogo for definido, troque:

```json
"home": "Match 73 Winner"  →  "home": "South Africa"   (ou quem ganhar)
```

E mude `"placeholder": false` quando ambos os times estiverem definidos.

---

## Resumo do fluxo

1. Grupo termina → descubra 1º, 2º (e 3ºs que avançam)
2. Edite `data/matches.json` — troque nomes, mude `placeholder` para `false`
3. `git add data/matches.json && git commit -m "atualiza times mata-mata" && git push`
4. `npx wrangler deploy`
5. Usuários veem os jogos abertos para palpites automaticamente (jogos `placeholder: false` com kickoff futuro ficam abertos)
