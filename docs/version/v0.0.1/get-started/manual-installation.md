# Manual Installation

Follow these steps to manually install components:

## 1. Pick a component

Preview components and find something you like, then head to the Code tab.

## 2. Install dependencies

Components may use external libraries, don't forget to install them. For example, the SplitText component requires GSAP for smooth animations.

```bash
npm install gsap
```

## 3. Copy the code

The Code tab also contains all the code you need to copy - you can use the controls below to switch between technologies on the Code tab.

## 4. Use the component

A basic usage example is provided for every component, and if you want to go into details, you can check all the available props on the Preview tab.

```javascript
import SplitText from "./SplitText";

<SplitText
  text="Hello, you!"
  delay={100}
  duration={0.6}
/>
```

## 5. Customize styling

Modify the component's CSS to match your design system:

```css
.split-text {
  font-family: 'Your Font', sans-serif;
  color: #your-color;
  font-size: 2rem;
}
```

## 6. Test your implementation

Make sure to test the component in different scenarios:

- Different screen sizes
- Various text lengths
- Edge cases and error states

## That's all!

From here on, it's all about how you integrate the component into your project. The code is yours to play around with - modify styling, functionalities, anything goes!