import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import SendIcon from '@mui/icons-material/Send'
import { Socket } from 'socket.io-client'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { localPort } from '@/utils/constants'

export default function InputBox({
  channelID,
  respond,
  socket,
}: {
  channelID: string
  respond: string
  socket: Socket
}) {
  const router = useRouter()
  const selectFile = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [user, setUser] = useState({ userID: '', userName: '' })
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }
  const onClick = async () => {
    if (selectFile.current?.files?.length !== 0) {
      const form = new FormData()
      if (selectFile && selectFile.current && selectFile.current.files) {
        form.append('file', selectFile.current.files[0])
        const res = await fetch(`${localPort}/chats/file`, {
          method: 'POST',
          headers: {
            Accept: '*/*',
          },
          body: form,
        })
        const data = await res.text()
        if (respond !== '') {
          socket.emit('addResponse', {
            chatId: respond,
            channel: channelID,
            content: data,
            sender: user.userID,
            isFile: true,
          })
        } else {
          socket.emit('postMessage', {
            content: data,
            channel: channelID,
            sender: user.userID,
            isFile: true,
          })
        }
      }
    }
    if (respond !== '') {
      socket.emit('addResponse', {
        sender: user.userID,
        content: text,
        channel: channelID,
        chatId: respond,
        isFile: false,
      })
    } else {
      socket.emit('postMessage', {
        content: text,
        channel: channelID,
        sender: user.userID,
        isFile: false,
      })
    }
    setText('')
  }

  useEffect(() => {
    const i = localStorage.getItem('_id') || ''
    const t = localStorage.getItem('token') || ''
    const getData = async () => {
      try {
        const uRes = await fetch(`${localPort}/users/${i}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            token: t,
          },
        })
        const uData = await uRes.json()
        setUser({ userID: i, userName: uData.userName })
      } catch (err) {
        router.push('/')
      }
    }
    getData()
  }, [router])
  return (
    <Stack
      direction="column"
      spacing={1}
      alignItems="flex-start"
      sx={{ border: 1, borderRadius: 2, borderColor: 'gray' }}
    >
      <TextField
        id="outlined-multiline-static"
        multiline
        fullWidth
        rows={4}
        placeholder="Type a message"
        value={text}
        onChange={onChange}
        sx={{ '& fieldset': { border: 'none' } }}
      />
      <div style={{ width: '100%' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          paddingX={1}
          paddingBottom={0.5}
        >
          <input type="file" style={{ display: 'none' }} ref={selectFile} />
          <IconButton
            aria-label="file"
            size="small"
            color="default"
            onClick={() => {
              selectFile.current?.click()
            }}
          >
            <AttachFileOutlinedIcon />
          </IconButton>
          <IconButton
            aria-label="submit"
            size="small"
            color="default"
            onClick={onClick}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </div>
    </Stack>
  )
}
