// https://makecode.com/_dc6Hs7KuYAgy
const tempRanges = [
    { min: 0, max: 9, color: 0x0000FF }, // Blue
    { min: 10, max: 19, color: 0x00FF00 }, // Green
    { min: 20, max: 29, color: 0xFFFF00 }, // Yellow
    { min: 30, max: 40, color: 0xFF8000 }, // Orange
    { min: 40, max: 50, color: 0xFF0000 } // Red
];
// Function to read and validate temperature
function readTemperature(): number {
    let temp = input.temperature(TemperatureUnit.Celsius);
    return Math.constrain(temp, 0, 50);
}
// Function for initial animation
function initialAnimation() {
    light.showAnimation(light.rainbowAnimation, 200);
    light.clear();
}
// Function to calculate brightness based on step and ledCount
function calculateBrightness(ledIndex: number, ledCount: number): number {
    return Math.map(ledIndex, 0, ledCount - 1, 10, 255);
}
// Function to display temperature with growing effect
function displayTemperature(temp: number, step: number = 1.5) {
    // Precompute ledCounts for each range
    let ranges = tempRanges.map(r => {
        let ledCounts: number[] = [];
        for (let t = r.min; t <= r.max; t++) {
            ledCounts[t - r.min] = Math.map(t, r.min, r.max, 1, 10);
        }
        return { min: r.min, max: r.max, color: r.color, ledCounts: ledCounts };
    });
    // Loop through the temperature values up to the given temp in steps
    for (let t = 0; t <= temp; t += step) {
        let range = ranges.find(r => t >= r.min && t <= r.max);
        if (!range) continue;
        // Get the ledCount for the current temperature
        let ledCount = range.ledCounts[Math.floor(t - range.min)];
        // Set the LEDs based on the ledCount
        for (let i = 0; i < 10; i++) {
            if (i < ledCount) {
                let brightness = calculateBrightness(i, ledCount);
                light.setPixelColor(i, light.fade(range.color, brightness));
            } else {
                light.setPixelColor(i, 0x000000);
            }
        }
        pause(2); // Faster animation
    }
}
// Function for blinking effect
function blinkFinalColor(temp: number) {
    let range = tempRanges.find(r => temp >= r.min && temp <= r.max);
    if (!range) return;
    let ledCount = Math.map(temp, range.min, range.max, 1, 10);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < ledCount; j++) {
            light.setPixelColor(j, range.color);
        }
        pause(300);
        light.clear();
        pause(300);
    }
}
// Variable to control sound bar display
let showSoundBar = true;
// Button B click handler
input.buttonB.onEvent(ButtonEvent.Click, function () {
    initialAnimation();
    let temp = readTemperature();
    displayTemperature(temp);
    blinkFinalColor(temp);
    console.log(`Temperature: ${temp}°C`);
});
// Button A click handler to toggle sound bar display
input.buttonA.onEvent(ButtonEvent.Click, function () {
    showSoundBar = !showSoundBar;
    if (!showSoundBar) {
        light.clear();
    }
});
// Shake gesture handler
input.onGesture(Gesture.FaceDown, function () {
    light.setBrightness(2);
})
input.onGesture(Gesture.Shake, function () {
    music.setVolume(20);
    music.playMelody("C D E F G A B C5", 120);
});


function adjustBrightnessBasedOnAmbientLight() {
    let lightLevel = input.lightLevel();
    let brightness = Math.map(lightLevel, 0, 255, 10, 255);
    light.setBrightness(brightness);
}


let alarmArmed = false;
let alarmThreshold = 20;

input.touchA1.onEvent(ButtonEvent.Click, function () {
    alarmArmed = !alarmArmed;
    if (alarmArmed) {
        light.setAll(0x00FF00);
    } else {
        light.clear();
    }
});




// Sound bar display loop
forever(function () {
    adjustBrightnessBasedOnAmbientLight();

    if (showSoundBar) {
        light.graph(input.soundLevel(), 255);
    } else {
        pause(200); // Small pause to prevent busy-waiting
    }

    if (alarmArmed) {
        let motion = Math.abs(input.acceleration(Dimension.X)) +
            Math.abs(input.acceleration(Dimension.Y)) +
            Math.abs(input.acceleration(Dimension.Z));
        if (motion > alarmThreshold) {
            music.setVolume(20);
            music.playTone(Note.C4, 500);
            light.setAll(0xFF0000);
            pause(1000);
            light.clear();
            pause(1000);
        }
    }

});
