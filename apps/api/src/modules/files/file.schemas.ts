import { idSchema } from '@template/contracts';
import { z } from 'zod';


export const fileIdParamsSchema = z.object({ id: idSchema });
