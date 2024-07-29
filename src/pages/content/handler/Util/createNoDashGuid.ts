import { v4 as uuidv4 } from 'uuid';

export const createNoDashGuid = () => uuidv4().replace(new RegExp("-", "g"), "").toUpperCase();