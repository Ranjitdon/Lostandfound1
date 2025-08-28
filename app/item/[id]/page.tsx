"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Clock, MessageCircle, Send, Loader2, Mail, Phone, User } from "lucide-react"

interface Item {
  _id: string
  title: string
  description: string
  contactInfo: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

interface Comment {
  _id: string
  itemId: string
  text: string
  createdAt: string
  updatedAt: string
}

interface ItemData {
  item: Item
  comments: Comment[]
}

export default function ItemDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [itemData, setItemData] = useState<ItemData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState("")
  const [commentSuccess, setCommentSuccess] = useState("")

  useEffect(() => {
    if (itemId) {
      fetchItemDetails()
    }
  }, [itemId])

  const fetchItemDetails = async () => {
    try {
      const response = await fetch(`/api/items/${itemId}`)
      const result = await response.json()

      if (result.success) {
        setItemData(result.data)
      } else {
        setError(result.error || "Failed to fetch item details")
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setError("Failed to load item details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setCommentError("")
    setCommentSuccess("")
    setIsSubmittingComment(true)

    try {
      const response = await fetch(`/api/items/${itemId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newComment.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        setCommentSuccess("Comment added successfully!")
        setNewComment("")
        // Refresh item details to show new comment
        await fetchItemDetails()
        // Clear success message after 3 seconds
        setTimeout(() => setCommentSuccess(""), 3000)
      } else {
        setCommentError(result.error || "Failed to add comment")
      }
    } catch (error) {
      console.error("Comment error:", error)
      setCommentError("Failed to add comment. Please try again.")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatContactInfo = (contactInfo: string) => {
    // Simple detection for email and phone patterns
    const emailPattern = /\S+@\S+\.\S+/
    const phonePattern = /[\d\s\-$$$$+]+/

    if (emailPattern.test(contactInfo)) {
      return (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <a href={`mailto:${contactInfo}`} className="text-primary hover:underline">
            {contactInfo}
          </a>
        </div>
      )
    } else if (phonePattern.test(contactInfo) && contactInfo.replace(/\D/g, "").length >= 10) {
      return (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <a href={`tel:${contactInfo}`} className="text-primary hover:underline">
            {contactInfo}
          </a>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{contactInfo}</span>
        </div>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading item details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !itemData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
          <Alert variant="destructive">
            <AlertDescription>{error || "Item not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const { item, comments } = itemData

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Item Details */}
          <div className="space-y-6">
            <Card>
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={item.imageUrl || "/placeholder.svg?height=500&width=500"}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl text-balance">{item.title}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Posted on {formatDate(item.createdAt)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground text-pretty">{item.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  {formatContactInfo(item.contactInfo)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Comments ({comments.length})
                </CardTitle>
                <CardDescription>Share information or ask questions about this item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{newComment.length}/500 characters</p>
                    <Button type="submit" disabled={!newComment.trim() || isSubmittingComment}>
                      {isSubmittingComment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {commentError && (
                  <Alert variant="destructive">
                    <AlertDescription>{commentError}</AlertDescription>
                  </Alert>
                )}

                {commentSuccess && (
                  <Alert>
                    <AlertDescription className="text-green-600">{commentSuccess}</AlertDescription>
                  </Alert>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className="border rounded-lg p-4 space-y-2">
                        <p className="text-pretty">{comment.text}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
