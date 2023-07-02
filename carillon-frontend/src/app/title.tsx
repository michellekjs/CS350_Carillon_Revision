'use client'

import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Image from 'next/image'

export default function Title() {
  return (
    <Stack
      direction="row"
      spacing={4}
      justifyContent="center"
      alignItems="center"
    >
      <Image src="/logo.svg" height={200} width={200} alt="logo" />
      <Typography variant="h1" sx={{ fontWeight: '900', color: '#2f6eba' }}>
        Carillon
      </Typography>
    </Stack>
  )
}
