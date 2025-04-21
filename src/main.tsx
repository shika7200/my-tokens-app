import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import  JsonFileUploader from './JsonFileUploader.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <JsonFileUploader/>
  </StrictMode>,
)
