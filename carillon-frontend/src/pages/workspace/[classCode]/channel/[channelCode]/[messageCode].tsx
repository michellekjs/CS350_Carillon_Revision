import type {
  InferGetStaticPropsType,
  GetStaticProps,
  GetStaticPaths,
} from 'next'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { localPort } from '@/utils/constants'
import SideBar from '../../../../../components/SideBar'
import MessageBlock, { MsgProps } from '../../../../../components/MessageBlock'
import InputBox from '../../../../../components/InputBox'

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}
export const getStaticProps: GetStaticProps = async () => {
  try {
    const cRes = await fetch(`${localPort}/channels/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    const channels = await cRes.json()
    return { props: { channels } }
  } catch (err) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
}

export default function ChannelRespComp({
  channels,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const [channel, setChannel] = useState('')
  const [chat, setChat] = useState<MsgProps>({
    id: '',
    content: '',
    responses: [],
    reactions: { Check: [], Favorite: [], Moodbad: [], Thumbup: [] },
    sender: { id: '', name: '' },
    isFile: false,
    isDeleted: false,
  })
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)
  const channelID = router.query.channelCode
  const msgID = router.query.messageCode

  const onAddResponse = (res: {
    respondedChatId: string
    response: {
      content: string
      sender: { _id: string; userName: string }
      _id: string
      isFile: boolean
      isDeleted: boolean
    }
  }) => {
    setChat((prevChat: MsgProps) => {
      if (res.respondedChatId !== prevChat.id) {
        return prevChat
      }
      return {
        ...prevChat,
        responses: [
          ...(prevChat.responses ? prevChat.responses : []),
          {
            id: res.response._id,
            content: res.response.content,
            reactions: { Check: [], Favorite: [], Moodbad: [], Thumbup: [] },
            sender: {
              id: res.response.sender._id,
              name: res.response.sender.userName,
            },
            isFile: res.response.isFile,
            isDeleted: res.response.isDeleted,
          },
        ],
      }
    })
  }

  const onDeleteMessage = (res: {
    _id: string
    content: string
    isFile: boolean
    isDeleted: boolean
  }) => {
    setChat((prevChat: MsgProps) => {
      if (!prevChat) {
        return {
          id: '',
          content: '',
          responses: [],
          reactions: { Check: [], Favorite: [], Moodbad: [], Thumbup: [] },
          sender: { id: '', name: '' },
          isFile: false,
          isDeleted: false,
        }
      }
      if (prevChat.id === res._id) {
        return {
          ...res,
          id: res._id,
          responses: prevChat.responses,
          reactions: prevChat.reactions,
          sender: prevChat.sender,
        }
      }
      if (prevChat && prevChat.responses) {
        return {
          ...prevChat,
          responses: prevChat.responses.map((c) =>
            c.id === res._id
              ? {
                  ...res,
                  id: res._id,
                  responses: c.responses,
                  reactions: c.reactions,
                  sender: c.sender,
                }
              : c,
          ),
        }
      }
      return { ...prevChat }
    })
  }

  const onEditMessage = (res: {
    _id: string
    content: string
    isFile: boolean
    isDeleted: boolean
  }) => {
    setChat((prevChat: MsgProps) => {
      if (!prevChat) {
        return {
          id: '',
          content: '',
          responses: [],
          reactions: { Check: [], Favorite: [], Moodbad: [], Thumbup: [] },
          sender: { id: '', name: '' },
          isFile: false,
          isDeleted: false,
        }
      }
      if (prevChat.id === res._id) {
        return {
          ...res,
          id: res._id,
          responses: prevChat.responses,
          reactions: prevChat.reactions,
          sender: prevChat.sender,
        }
      }
      if (prevChat && prevChat.responses) {
        return {
          ...prevChat,
          responses: prevChat.responses.map((c) =>
            c.id === res._id
              ? {
                  ...res,
                  id: res._id,
                  responses: c.responses,
                  reactions: c.reactions,
                  sender: c.sender,
                }
              : c,
          ),
        }
      }
      return { ...prevChat }
    })
  }

  const onAddReaction = (res: {
    chatId: string
    reaction: {
      reactionType: string
      reactor: { _id: string; userName: string }
      _id: string
    }
  }) => {
    setChat((prevChat: MsgProps) => {
      if (!prevChat) {
        return {
          id: '',
          content: '',
          responses: [],
          reactions: { Check: [], Favorite: [], Moodbad: [], Thumbup: [] },
          sender: { id: '', name: '' },
          isFile: false,
          isDeleted: false,
        }
      }
      if (prevChat.id === res.chatId) {
        return {
          ...prevChat,
          reactions: {
            ...prevChat.reactions,
            [res.reaction.reactionType]: [
              ...prevChat.reactions[res.reaction.reactionType],
              {
                id: res.reaction._id,
                userID: res.reaction.reactor._id,
                userName: res.reaction.reactor.userName,
              },
            ],
          },
        }
      }
      if (prevChat && prevChat.responses) {
        return {
          ...prevChat,
          responses: prevChat.responses.map((c) =>
            c.id === res.chatId
              ? {
                  ...c,
                  reactions: {
                    ...c.reactions,
                    [res.reaction.reactionType]: [
                      ...c.reactions[res.reaction.reactionType],
                      {
                        id: res.reaction._id,
                        userID: res.reaction.reactor._id,
                        userName: res.reaction.reactor.userName,
                      },
                    ],
                  },
                }
              : c,
          ),
        }
      }
      return { ...prevChat }
    })
  }

  const onDeleteReaction = (res: {
    chatId: string
    reaction: {
      reactionType: string
      _id: string
    }
  }) => {
    setChat((prevChat: MsgProps) => {
      if (!prevChat) {
        return {
          id: '',
          content: '',
          responses: [],
          reactions: { Check: [], Favorite: [], Moodbad: [], Thumbup: [] },
          sender: { id: '', name: '' },
          isFile: false,
          isDeleted: false,
        }
      }
      if (prevChat.id === res.chatId) {
        return {
          ...prevChat,
          reactions: {
            ...prevChat.reactions,
            [res.reaction.reactionType]: prevChat.reactions[
              res.reaction.reactionType
            ].filter((r) => r.id !== res.reaction._id),
          },
        }
      }
      if (prevChat && prevChat.responses) {
        return {
          ...prevChat,
          responses: prevChat.responses.map((c) =>
            c.id === res.chatId
              ? {
                  ...c,
                  reactions: {
                    ...c.reactions,
                    [res.reaction.reactionType]: c.reactions[
                      res.reaction.reactionType
                    ].filter((r) => r.id !== res.reaction._id),
                  },
                }
              : c,
          ),
        }
      }
      return { ...prevChat }
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => {
    scrollToBottom()
  }, [chat])

  useEffect(() => {
    const skt = io(localPort)
    setSocket(skt)
    scrollToBottom()
    return () => {
      skt.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket) {
      return
    }
    const id = localStorage.getItem('_id')
    if (!id) {
      router.push('/')
    }
    socket.emit('connection')
    socket.emit('init', { userId: id })
    socket.on('addResponse', onAddResponse)
    socket.on('deleteMessage', onDeleteMessage)
    socket.on('editMessage', onEditMessage)
    socket.on('addReaction', onAddReaction)
    socket.on('deleteReaction', onDeleteReaction)
  }, [socket, router])

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${localPort}/chats/${channelID}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })
        const data = await res.json()
        const filterData = data.filter(
          (d: {
            _id: string
            content: string
            channel: string
            responses_info: {
              _id: string
              content: string
              channel: string
              reactions_info: {
                reactionType: string
                reaction: {
                  _id: string
                  reactorId: string
                  reactorName: string
                }[]
              }[]
              sender_info: { _id: string; userName: string }
              isFile: boolean
              isDeleted: boolean
            }[]
            reactions_info: {
              reactionType: string
              reaction: {
                _id: string
                reactorId: string
                reactorName: string
              }[]
            }[]
            sender_info: { _id: string; userName: string }
            isFile: boolean
            isDeleted: boolean
          }) => {
            return d._id === msgID
          },
        )[0]
        const checkListO =
          filterData.reactions_info.length > 0 &&
          filterData.reactions_info.find(
            (e: { reactionType: string }) => e.reactionType === 'Check',
          )
        const favoriteListO =
          filterData.reactions_info.length > 0 &&
          filterData.reactions_info.find(
            (e: { reactionType: string }) => e.reactionType === 'Favorite',
          )
        const moodbadListO =
          filterData.reactions_info.length > 0 &&
          filterData.reactions_info.find(
            (e: { reactionType: string }) => e.reactionType === 'Moodbad',
          )
        const thumbupListO =
          filterData.reactions_info.length > 0 &&
          filterData.reactions_info.find(
            (e: { reactionType: string }) => e.reactionType === 'Thumbup',
          )
        setChat({
          id: filterData._id /* eslint no-underscore-dangle: 0 */,
          content: filterData.content,
          responses: filterData.responses_info.map(
            (r: {
              _id: string
              content: string
              channel: string
              reactions_info: {
                reactionType: string
                reaction: {
                  _id: string
                  reactorId: string
                  reactorName: string
                }[]
              }[]
              sender_info: { _id: string; userName: string }
              isFile: boolean
              isDeleted: boolean
            }) => {
              const checkListI =
                r.reactions_info.length > 0 &&
                r.reactions_info.find(
                  (e: { reactionType: string }) => e.reactionType === 'Check',
                )
              const favoriteListI =
                r.reactions_info.length > 0 &&
                r.reactions_info.find(
                  (e: { reactionType: string }) =>
                    e.reactionType === 'Favorite',
                )
              const moodbadListI =
                r.reactions_info.length > 0 &&
                r.reactions_info.find(
                  (e: { reactionType: string }) => e.reactionType === 'Moodbad',
                )
              const thumbupListI =
                r.reactions_info.length > 0 &&
                r.reactions_info.find(
                  (e: { reactionType: string }) => e.reactionType === 'Thumbup',
                )
              return {
                id: r._id,
                content: r.content,
                responses: [],
                reactions: {
                  Check: checkListI
                    ? checkListI.reaction.map(
                        (u: {
                          _id: string
                          reactorId: string
                          reactorName: string
                        }) => ({
                          id: u._id,
                          userID: u.reactorId,
                          userName: u.reactorName,
                        }),
                      )
                    : [],
                  Favorite: favoriteListI
                    ? favoriteListI.reaction.map(
                        (u: {
                          _id: string
                          reactorId: string
                          reactorName: string
                        }) => ({
                          id: u._id,
                          userID: u.reactorId,
                          userName: u.reactorName,
                        }),
                      )
                    : [],
                  Moodbad: moodbadListI
                    ? moodbadListI.reaction.map(
                        (u: {
                          _id: string
                          reactorId: string
                          reactorName: string
                        }) => ({
                          id: u._id,
                          userID: u.reactorId,
                          userName: u.reactorName,
                        }),
                      )
                    : [],
                  Thumbup: thumbupListI
                    ? thumbupListI.reaction.map(
                        (u: {
                          _id: string
                          reactorId: string
                          reactorName: string
                        }) => ({
                          id: u._id,
                          userID: u.reactorId,
                          userName: u.reactorName,
                        }),
                      )
                    : [],
                },
                sender: {
                  id: r.sender_info._id,
                  name: r.sender_info.userName,
                },
                isFile: r.isFile,
                isDeleted: r.isDeleted,
              }
            },
          ),
          reactions: {
            Check: checkListO
              ? checkListO.reaction.map(
                  (u: {
                    _id: string
                    reactorId: string
                    reactorName: string
                  }) => ({
                    id: u._id,
                    userID: u.reactorId,
                    userName: u.reactorName,
                  }),
                )
              : [],
            Favorite: favoriteListO
              ? favoriteListO.reaction.map(
                  (u: {
                    _id: string
                    reactorId: string
                    reactorName: string
                  }) => ({
                    id: u._id,
                    userID: u.reactorId,
                    userName: u.reactorName,
                  }),
                )
              : [],
            Moodbad: moodbadListO
              ? moodbadListO.reaction.map(
                  (u: {
                    _id: string
                    reactorId: string
                    reactorName: string
                  }) => ({
                    id: u._id,
                    userID: u.reactorId,
                    userName: u.reactorName,
                  }),
                )
              : [],
            Thumbup: thumbupListO
              ? thumbupListO.reaction.map(
                  (u: {
                    _id: string
                    reactorId: string
                    reactorName: string
                  }) => ({
                    id: u._id,
                    userID: u.reactorId,
                    userName: u.reactorName,
                  }),
                )
              : [],
          },
          sender: {
            id: filterData.sender_info._id,
            name: filterData.sender_info.userName,
          },
          isFile: filterData.isFile,
          isDeleted: filterData.isDeleted,
        })
        setChannel(() => {
          const filteredList = channels.filter(
            (ch: { _id: string; name: string }) => ch.name === channelID,
          )
          const filteredChannel = filteredList[0]
          return filteredChannel.name
        })
      } catch (err) {
        router.push('/')
      }
    }
    getData()
  }, [router, channelID, channels, msgID])

  if (chat.id === '' || socket === null) {
    return <div></div>
  }

  return (
    <SideBar>
      <Stack
        direction="column"
        spacing={2}
        sx={{ height: '90vh', display: 'flex' }}
      >
        <Typography variant="h3">{channel}</Typography>
        <Stack
          sx={{
            flexGrow: 1,
            overflowY: 'scroll',
          }}
        >
          <MessageBlock message={chat} respond={false} socket={socket} />
          <Divider orientation="horizontal" flexItem />
          <div style={{ paddingLeft: '50px' }}>
            <Stack direction="column" spacing={2}>
              <div>Responses</div>
              {chat.responses &&
                chat.responses.map((msg: MsgProps) => (
                  <MessageBlock
                    key={msg.id}
                    message={msg}
                    respond={false}
                    socket={socket}
                  />
                ))}
              <div ref={messagesEndRef} />
            </Stack>
          </div>
        </Stack>
        <InputBox
          channelID={String(channelID)}
          respond={chat.id}
          socket={socket}
        />
      </Stack>
    </SideBar>
  )
}
