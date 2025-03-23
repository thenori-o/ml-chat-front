import type { HorizontalNavItems } from '@layouts/types'
import apps from './apps'
import charts from './charts'
import dashboard from './dashboard'
import forms from './forms'
import misc from './misc'
import pages from './pages'
import tables from './tables'
import uiElements from './ui-elements'

export default [ ...apps, ...dashboard, ...pages, ...uiElements, ...forms, ...tables, ...charts, ...misc] as HorizontalNavItems
