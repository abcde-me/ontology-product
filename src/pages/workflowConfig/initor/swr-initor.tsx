import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'
import React from 'react'

interface SwrInitorProps {
  children: ReactNode
}
const SwrInitor = ({
  children,
}: SwrInitorProps) => {  
  return (
    <SWRConfig value={{
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }}>
      {children}
    </SWRConfig>
  )
}

export default SwrInitor
