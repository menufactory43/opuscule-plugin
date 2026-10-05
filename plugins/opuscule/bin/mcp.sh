#!/bin/sh
# Le serveur MCP d'Opuscule, installé par https://opuscule.app/install.sh dans ~/.local/bin.
PATH="$HOME/.local/bin:$PATH"
exec opuscule mcp
