const random = (min = 0, max = 0) => min + Math.round(Math.random() * (max - min));

const randomDay = () => random(1, 28);

const randomMonth = () => random(1, 12);

const randomYear = () => random(2050, 2100);

export const randomDate = () => [randomDay(), randomMonth(), randomYear()];
