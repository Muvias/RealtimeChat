'use client'

import { useRef, useState } from 'react';

import TextareaAutosize from 'react-textarea-autosize';
import Button from './ui/Button';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ChatInputProps {
    chatPartner: User
    chatId: string
}

export default function ChatInput({ chatPartner, chatId }: ChatInputProps) {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

    const [input, setInput] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function sendMessage() {
        setIsLoading(true)

        try {
            await axios.post('/api/message/send', { text: input, chatId })

            setInput('')
            textAreaRef.current?.focus()
        } catch (error) {
            toast.error('Algo deu errado. Por favor tente novamente mais tarde.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="px-4 pt-4 mb-2 sm:mb-0 border-t border-gray-200">
            <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                <TextareaAutosize
                    ref={textAreaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                        }
                    }}
                    placeholder={`Mensagem ${chatPartner.name}`}
                    className='block w-full sm:py-1.5 sm:text-sm sm:leading-6 resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0'
                />

                <div
                    onClick={() => textAreaRef.current?.focus()}
                    className='py-2'
                    aria-hidden='true'
                >
                    <div className='py-px'>
                        <div className='h-9' />
                    </div>
                </div>

                <div className='absolute flex justify-between right-0 bottom-0 py-2 pl-3 pr-2'>
                    <div className='flex-shrink-0'>
                        <Button
                            type='submit'
                            onClick={sendMessage}
                            isLoading={isLoading}
                        >
                            Enviar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}