import { type ScoreData, type ScoreReference } from './booklet'
import { v4 as uuidv4 } from 'uuid';

export const unterwegs: ScoreData[] = [

];
export const gotteslob: ScoreData[] = [

    {
        author: undefined,
        reference: {
            source: 'Gotteslob (2003)',
            no: 88,
        },
        lyrics: ['Seg-ne, Va-ter, die-se Ga-ben. A----men, A----men.',
            'Dank dir, Va-ter, für die Ga-ben. A----men, A----men.'
        ],
        width: 400,
        title: 'Segne Vater diese Gaben',
        abc: '"C""^①"cG"F"A"C"E|"Dm"FD"G"G"C"HE|"^②"(CD/2E/2F)G|(AB/2c/2B)Hc|]',
        timing: [4, 4],
        baseNote: [1, 4],
        speed: [1, 4, 120],
        key: 'C',
        linesettings: {
            minSpacing: 1,
            maxSpacing: 2,
            preferredMeasuresPerLine: 4
        },
        scale: 0.7
    },
]

export const scores = $state([] as ScoreData[]);

export function newScore<T extends ScoreData>(from?: T): T {
    return {
        ...(from ?? {
            author: undefined,
            reference: null,
            lyrics: [
                'Al-le mei-ne Ent-chen, schwim-men auf dem See, schwim-men auf dem See. Köpf-chen in das Was-ser, Schwänz-chne in die höh.'
            ],
            title: 'Neuer Titel',
            abc: 'CDEF|G2G2|AAAA|G4|AAAA|G4|FFFF|E2E2|DDDD|C4',
            width: 400,
            timing: [4, 4],
            baseNote: [1, 4],
            speed: [1, 4, 100],
            key: 'C',
            linesettings: {
                minSpacing: 1,
                maxSpacing: 2,
                preferredMeasuresPerLine: 4
            },
            scale: 0.7
        } as T),
        id: uuidv4(),
    }
}

export function init(refresh?: boolean) {
    if (scores.length == 0 || refresh) {

        const loaded = loadScores();
        scores.splice(0, scores.length);
        for (const s of loaded) {
            scores.push(s);
        }
    }
}

export function storScore(score: ScoreData & { readonly id: string }, override: boolean = true) {
    if (!override) {
        if (localStorage.getItem(`score-${score.id}`) != null) {
            return false;
        }
    }
    localStorage.setItem(`score-${score.id}`, JSON.stringify(score));
    const index = scores.findIndex(x => x.id == score.id);
    if (index == -1) {
        scores.push(score);
    } else {
        scores[index] = score;
    }
    return true;
}

function loadScores(): ScoreData[] {
    const ownScorem = Array.from({ length: window.localStorage.length })
        .map((_, i) => window.localStorage.key(i))
        .filter((x): x is string => x != undefined && x.startsWith('score-'))
        .map(x => window.localStorage.getItem(x))
        .filter((x): x is string => !!x)
        .map(x => JSON.parse(x) as ScoreData);
    return [
        ...gotteslob,
        ...unterwegs,
        ...ownScorem
    ]
}

export function findScore(reference: undefined | null): null;
export function findScore(reference: ScoreReference | string): ScoreData;
export function findScore(reference: ScoreReference | string | undefined | null): ScoreData | null;
export function findScore(reference: ScoreReference | string | undefined | null): ScoreData | null {
    if (reference == undefined || reference == null) {
        return null;
    } else if (typeof reference === 'string') {
        return scores.filter(x => x.id == reference)[0] ?? null;
    } else {
        return scores.filter(x => x.reference?.source == reference.source && x.reference.no == reference.no)[0] ?? null;
    }
}

export function getTitle(score: ScoreData, type: 'omit Id' | 'include id' = 'include id') {
    const lookup: Record<string, string | undefined> = {
        'Gotteslob (2003)': 'GL',
    }
    return score.title +
        (score.reference
            ? ` (${lookup[score.reference.source] ?? score.reference.source} ${score.reference.no})` : '')
        + (score.id && type == 'include id'
            ? ` <ID: ${score.id}>` : '');
}
