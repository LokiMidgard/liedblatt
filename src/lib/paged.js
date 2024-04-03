// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import * as Paged from '/node_modules/pagedjs/dist/paged.esm.js';
//import * as Paged from 'pagedjs/dist/paged.esm';
// } from '../ pagedjs/dist/paged.esm';

/**
 * 
 * @param source {string}
 * @param target {HTMLElement}
 * @returns {Promise<{size:number, performance:TimeRanges, total:number,pages:any[]}>} a Promise
 */
export function doPaged(source, target, style) {
    const paged = new Paged.Previewer();
    return paged.preview(source, [{'/':style}], target);
}
