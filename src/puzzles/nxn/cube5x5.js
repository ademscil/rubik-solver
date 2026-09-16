/**
 * src/puzzles/nxn/cube5x5.js
 * Professor's Cube 5x5 Definition Adapter
 */

import { createNxNDefinition } from './NxNFactory.js';

export const cube5x5Definition = createNxNDefinition(5);
export const NET_LAYOUT_5X5 = cube5x5Definition.netLayout;
export const generateScramble5x5 = (len) => cube5x5Definition.generateScramble(len);
export default cube5x5Definition;
