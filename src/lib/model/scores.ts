import type { ScoreData, ScoreReference } from './booklet'

export const gotteslob: ScoreData[] = [
    {
        author: {
            text: 'Joachim Schwarz 1962',
            music: 'Joachim Schwarz 1962'
        },
        reference: {
            source: 'Gotteslob (2003)',
            no: 86
        },
        baseNote: [1, 4],
        key: 'C',
        speed: [1, 4, 120],
        timing: [2, 2],
        lyrics: ['Aus-gang und Ein-gang, An-fang und En--de lie-gen bei dir, Herr, füll du uns die Hän-de!'],
        title: 'Ausgang und Eingang',
        abc: `"C""^①"C2DE|"F"F2"C"HE2|"^②""C"E2FG|(AE)HG2|
"^③"c2Bc|B2Hc2|"^④"G6/4A2/4FE|D2HC2:|
`,
        linesettings: {
            minSpacing: 1,
            maxSpacing: 2,
            preferredMeasuresPerLine: 4
        },
        scale: 0.7
    },
    {
        author: undefined,
        reference: {
            source: 'Gotteslob (2003)',
            no: 88,
        },
        lyrics: ['Seg-ne, Va-ter, die-se Ga-ben. A----men, A----men.',
            'Dank dir, Va-ter, für die Ga-ben. A----men, A----men.'
        ],
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

export function findScore(reference: undefined | null): null;
export function findScore(reference: ScoreReference): ScoreData;
export function findScore(reference: ScoreReference | undefined | null): ScoreData | null;
export function findScore(reference: ScoreReference | undefined | null): ScoreData | null {
    if (reference == undefined || reference == null) {
        return null;
    } else if (reference.source == 'Gotteslob (2003)') {
        return gotteslob.filter(x => x.reference?.source == reference.source && x.reference.no == reference.no)[0]
    } else if (reference.source == 'Unterwegs') {
        return gotteslob.filter(x => x.reference?.source == reference.source && x.reference.no == reference.no)[0]
    } else {
        throw new Error(`Unknown Reference ${reference.source}`)
    }

}

export function getTitle(score: ScoreData) {
    return score.title +
        (score.reference?.source == 'Gotteslob (2003)'
            ? ` (GL ${score.reference.no})` : '')
        + (score.reference?.source == 'Unterwegs'
            ? ` (Unterwegs ${score.reference.no})` : '');
}
