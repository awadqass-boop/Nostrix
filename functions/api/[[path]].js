// Cloudflare Pages Function: every /api/* request is handled by server/router.js.
import { handle } from '../../server/router.js';

export const onRequest = (context) => handle(context);
