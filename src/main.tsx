
import { StrictMode } from 'react'
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
