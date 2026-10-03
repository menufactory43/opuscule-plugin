# Opuscule pour Claude Code et Codex

[Opuscule](https://opuscule.app/codex/) fait un livre imprimé de tes sessions avec tes agents (Codex, Claude Code) :
une double page par session, ta demande telle quelle, ce qui s'est passé, les images créées. Tout est lu et filtré
sur ton Mac.

Ce plugin ajoute Opuscule à Claude Code et à Codex :

- **« @Opuscule où en est mon volume ? »** : sessions par projet, places dans le livre, données que le filtre retirera.
- **« @Opuscule garde ce moment pour le livre »** : l'échange qui vient d'avoir lieu aura sa double page dans le livre, tes mots et la réponse de l'agent tels quels.
- **« @Opuscule ouvre le Studio »** : relecture, résumés, couverture et commande, dans ton navigateur.
- **Formats et prix** du livre.
- **L'archive, si tu l'acceptes** : à chaque fin de tour, tes sessions et les images générées sont copiées sur ton Mac
  (`~/.opuscule/archive`), pour qu'aucune ne se perde. Opuscule te pose la question une fois (et Codex te demande
  aussi de valider ce réglage au lancement suivant).

Dans **Claude Code** (version récente, avec les mods), le plugin ajoute aussi :

- **`/livre`** : un panneau à côté de la conversation avec ton volume en cours (pages, sessions, épinglés, jours
  avant la clôture), les projets dans le livre ou hors du volume, un bouton pour ajouter le projet en cours,
  la progression du Studio quand il travaille, et les boutons Épingler, Studio et Actualiser.
- **La barre d'état** : `📖 automne 2026 · 12/37`.
- **Une suggestion d'épinglage** après un tour qui compte (un commit, un long travail, beaucoup d'actions de l'agent),
  une fois par session au plus.

Les outils ne renvoient à l'agent que des chiffres et des noms de projets, jamais le texte de tes sessions.

## Installation

1. Installe Opuscule (macOS) : `curl -fsSL https://opuscule.app/install.sh | sh`
2. Dans **Claude Code** :

   ```
   /plugin marketplace add menufactory43/opuscule-plugin
   /plugin install opuscule@opuscule-plugin
   ```

3. Dans **Codex** :

   ```sh
   codex plugin marketplace add menufactory43/opuscule-plugin
   codex plugin add opuscule@opuscule-plugin
   ```

Dans l'app Codex, le plugin apparaît aussi dans la liste des plugins une fois la source ajoutée.

---

## English

Opuscule turns your sessions with coding agents (Claude Code, Codex) into a printed book: one spread per session,
your prompt as typed, what happened, the images produced. Everything is read and filtered on your Mac.

This plugin adds Opuscule to **Claude Code** and **Codex**:

- **"@Opuscule where's my volume?"**: sessions per project, places left in the book, data the filter will remove.
- **"@Opuscule keep this moment for the book"**: the exchange that just happened gets its own spread.
- **"@Opuscule open the Studio"**: proofreading, summaries, cover and order, in your browser.
- **The archive, if you accept it**: after each turn, sessions and generated images are copied to `~/.opuscule/archive`
  on your Mac, so none are lost to Claude Code's 30-day cleanup.
- In Claude Code (recent version, with mods): a `/livre` panel, a status line (`📖 autumn 2026 · 12/37`) and a pin
  suggestion after a turn that matters.

The tools only return numbers and project names to the agent, never the text of your sessions.

**Install.** Install Opuscule on macOS (`curl -fsSL https://opuscule.app/install.sh | sh`), then:

- Claude Code: `/plugin marketplace add menufactory43/opuscule-plugin` and `/plugin install opuscule@opuscule-plugin`
- Codex: `codex plugin marketplace add menufactory43/opuscule-plugin` and `codex plugin add opuscule@opuscule-plugin`

The plugin is free and MIT-licensed. Composing and proofreading the book are free; you pay only if you print.
More at [opuscule.app/en](https://opuscule.app/en/).

---

© Opuscule · [opuscule.app](https://opuscule.app/) · [Confidentialité](https://opuscule.app/confidentialite/) · Licence MIT
