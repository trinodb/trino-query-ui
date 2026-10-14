import { createContext } from 'react'
import { Logger } from './logger'

export const LoggerContext = createContext(new Logger())
