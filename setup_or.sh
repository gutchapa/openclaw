#!/bin/bash
openclaw models auth paste-token --provider openrouter << 'INNER_EOF'
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
INNER_EOF
openclaw gateway restart
