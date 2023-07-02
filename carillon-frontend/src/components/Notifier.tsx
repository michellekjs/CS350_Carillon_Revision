import { useEffect } from 'react'
import Link from 'next/link'
import { io } from 'socket.io-client'
import { useRouter } from 'next/router'
import { ToastContainer, toast, cssTransition } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { localPort } from '@/utils/constants'
import './Notifier.css'
import { Typography, Stack } from '@mui/material'

const Slide = cssTransition({
  enter: 'slide-left',
  exit: 'slide-right',
  appendPosition: false,
  collapse: false,
})

function NewMessage({
  message,
}: {
  message: {
    content: string
    isFile: boolean
    userName: string
    channel: { id: string; name: string }
    workspace: { id: string; name: string }
  }
}) {
  return (
    <Link
      href={`/workspace/${message.workspace.id}/channel/${message.channel.id}`}
      style={{ textDecoration: 'none' }}
    >
      <Stack>
        <Typography variant="subtitle2" color="black">
          {message.workspace.name} | {message.channel.name}
        </Typography>
        <Typography variant="subtitle2" color="black">
          {message.userName}:
        </Typography>
        <Typography variant="body2" color="black">
          {message.isFile ? 'Sent a file' : message.content}
        </Typography>
      </Stack>
    </Link>
  )
}

function NewInvitation({
  invitation,
}: {
  invitation: {
    channel: { id: string; name: string }
    workspace: { id: string; name: string }
  }
}) {
  return (
    <Link
      href={`/workspace/${invitation.workspace.id}/channel/${invitation.channel.id}`}
      style={{ textDecoration: 'none' }}
    >
      <Stack>
        <Typography variant="subtitle2" color="black">
          {invitation.workspace.name} | {invitation.channel.name}
        </Typography>
        <Typography variant="subtitle2" color="black">
          You&apos;ve been invited to a new channel!
        </Typography>
      </Stack>
    </Link>
  )
}

export default function Notifier() {
  const router = useRouter()
  const url = router.asPath

  useEffect(() => {
    const socket = io(localPort)
    const id = localStorage.getItem('_id')
    if (!id) {
      socket.disconnect()
      router.push('/')
      return undefined
    }

    const onPostMessage = async (message: {
      content: string
      channel: string
      sender: { userName: string }
      isFile: boolean
    }) => {
      if (url.endsWith(message.channel)) {
        return
      }
      const res = await fetch(`${localPort}/channels`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data: {
        _id: string
        name: string
        workspace: {
          _id: string
          name: string
        }
      }[] = await res.json()
      const channel = data.find(
        (e) => e._id === message.channel /* eslint no-underscore-dangle: 0 */,
      )
      if (!channel) {
        return
      }
      toast(
        <NewMessage
          message={{
            content: message.content,
            isFile: message.isFile,
            userName: message.sender.userName,
            channel: { id: channel._id, name: channel.name },
            workspace: {
              id: channel.workspace._id,
              name: channel.workspace.name,
            },
          }}
        />,
      )
    }

    const onInvite = async (invitation: { users: string[]; room: string }) => {
      if (invitation.users.includes(id)) {
        socket.emit('join', { roomId: invitation.room, userId: id })
        const res = await fetch(`${localPort}/channels`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })
        const data: {
          _id: string
          name: string
          workspace: {
            _id: string
            name: string
          }
        }[] = await res.json()
        const channel = data.find(
          (e) => e._id === invitation.room /* eslint no-underscore-dangle: 0 */,
        )
        if (!channel) {
          return
        }
        toast(
          <NewInvitation
            invitation={{
              channel: { id: channel._id, name: channel.name },
              workspace: {
                id: channel.workspace._id,
                name: channel.workspace.name,
              },
            }}
          />,
        )
      }
    }

    socket.emit('init', { userId: id })
    socket.on('postMessage', onPostMessage)
    socket.on('invite', onInvite)
    return () => {
      socket.disconnect()
    }
  })

  return (
    <ToastContainer
      position="top-right"
      autoClose={false}
      hideProgressBar
      newestOnTop={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      transition={Slide}
      theme="light"
    />
  )
}
