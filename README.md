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

**English.** Opuscule turns your sessions with coding agents (Claude Code, Codex) into a printed book, composed and filtered on your Mac.
Install Opuscule (`curl -fsSL https://opuscule.app/install.sh | sh`), then in Claude Code
`/plugin marketplace add menufactory43/opuscule-plugin` and `/plugin install opuscule@opuscule-plugin`; in Codex
`codex plugin marketplace add menufactory43/opuscule-plugin` and `codex plugin add opuscule@opuscule-plugin`.
Ask Codex "where's my Opuscule volume?", "keep this moment for the book" or "open the Opuscule Studio".

© Opuscule · [opuscule.app](https://opuscule.app/) · [Confidentialité](https://opuscule.app/confidentialite/)
