const colors: string[] = [
    '#6f6776',
    '#9a9a97',
    '#c5ccb8',
    '#c38890',
    '#a593a5',
    '#666092',
    '#9a4f50',
    '#c28d75',
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
