import advancedFormat from 'dayjs/plugin/advancedFormat'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(advancedFormat)
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.extend(timezone)
