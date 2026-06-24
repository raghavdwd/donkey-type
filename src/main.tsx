/*
 * main.tsx
 * 
 * This is the entry point of our React application.
 * This is where the whole app starts loading and gets injected into the HTML page.
 * Basically when the browser loads the index.html file, it will see this script
 * and start running everything from here.
 * 
 * We are using React 19 which is the latest version of React at the time of writing.
 * React is a JavaScript library for building user interfaces. It was created by Facebook
 * and is one of the most popular front-end libraries in the world.
 */

/*
 * StrictMode is a wrapper component that React provides to help us catch bugs
 * during development. It does NOT render anything visible on the screen.
 * What it does is it intentionally double-invokes certain lifecycle methods and hooks
 * so that we can catch side effects that we might have forgotten to clean up.
 * This only happens in development mode, not in production.
 */
import { StrictMode } from 'react'

/*
 * createRoot is the new way to render React apps starting from React 18.
 * Before React 18, we used ReactDOM.render() but now we use createRoot().
 * The reason they changed this is because the new createRoot API gives us
 * access to concurrent features and better performance.
 * We pass the DOM element with id="root" which is defined in index.html.
 */
import { createRoot } from 'react-dom/client'

/*
 * We import our main CSS file here so that all the styles get applied to the app.
 * This includes Tailwind CSS which is a utility-first CSS framework that lets us
 * style things using class names instead of writing custom CSS.
 * We also import our custom theme variables and animations from this file.
 */
import './index.css'

/*
 * App is our root component. Everything in the application lives inside this component.
 * It contains the Header, the TypingArea, the StatsPanel (which shows results after a test),
 * and the HistoryModal (which lets you see all your past typing test results).
 */
import App from './App.tsx'

/*
 * This is where React actually connects to the DOM (Document Object Model).
 * We find the div with id="root" from index.html and render our App component inside it.
 * The exclamation mark (!) after getElementById is a TypeScript non-null assertion,
 * which means "I promise this element exists, don't complain about it being possibly null".
 * 
 * We wrap App in StrictMode to get the development benefits mentioned above.
 * The whole app gets mounted into this single div, which is why React apps are called
 * "Single Page Applications" or SPAs.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
