import { Grid, Typography, TextField } from '@mui/material'

export default function LabeledInputBox({
  label,
  value,
  style,
  type,
  onChange,
  onEnter,
}: {
  label: string
  value: string
  type?: string
  style?: React.CSSProperties
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onEnter?: () => void
}) {
  const styles: { [key: string]: React.CSSProperties } = {
    label: {
      display: 'flex',
      justifyContent: 'left',
      alignItems: 'end',
      height: '100%',
    },
  }

  return (
    <Grid container style={style}>
      <Grid item xs={4}>
        <div style={styles.label}>
          <Typography style={{ marginBottom: '3px' }}>{label}</Typography>
        </div>
      </Grid>
      <Grid item xs={8}>
        <TextField
          type={label === 'Password' ? 'password' : ''}
          variant="standard"
          defaultValue={value}
          placeholder={label}
          fullWidth
          onChange={onChange}
          onKeyDown={(e) => {
            if (!onEnter) return
            if (e.key === 'Enter') onEnter()
          }}
        />
      </Grid>
    </Grid>
  )
}
