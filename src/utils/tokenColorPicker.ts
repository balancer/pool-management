const colors: string[] = [
    '#FFCC80',
    '#CE93D8',
    '#B0BEC5',
    '#BCAAA4',
    '#FFF59D',
    '#80CBC4',
    '#F48FB1',
    '#90CAF9',
];

let colorIndex = 0;

export function getNextTokenColor(): string {
    const color = colors[colorIndex];
    colorIndex = colorIndex + 1;
    if (colorIndex >= colors.length) {
        colorIndex = 0;
    }
    return color;
}