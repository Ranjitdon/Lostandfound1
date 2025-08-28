"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface FormData {
  title: string
  description: string
  contactInfo: string
  image: File | null
}

export default function UploadPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    contactInfo: "",
    image: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (!formData.title.trim() || !formData.description.trim() || !formData.contactInfo.trim() || !formData.image) {
      setError("All fields are required")
      return
    }

    setIsLoading(true)

    try {
      const submitData = new FormData()
      submitData.append("title", formData.title.trim())
      submitData.append("description", formData.description.trim())
      submitData.append("contactInfo", formData.contactInfo.trim())
      submitData.append("image", formData.image)

      const response = await fetch("/api/items", {
        method: "POST",
        body: submitData,
      })

      const result = await response.json()

      if (result.success) {
        setSuccess("Item uploaded successfully!")
        // Reset form
        setFormData({
          title: "",
          description: "",
          contactInfo: "",
          image: null,
        })
        setImagePreview(null)
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        setError(result.error || "Failed to upload item")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setError("Failed to upload item. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Upload Lost/Found Item</CardTitle>
            <CardDescription>
              Share details about an item you've lost or found to help reunite it with its owner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Lost iPhone 14 Pro"
                  value={formData.title}
                  onChange={handleInputChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide detailed description including color, brand, location where lost/found, etc."
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={1000}
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">{formData.description.length}/1000 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information *</Label>
                <Input
                  id="contactInfo"
                  name="contactInfo"
                  type="text"
                  placeholder="Email, phone number, or other contact details"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image *</Label>
                <div className="flex flex-col gap-4">
                  <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} required />
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-48 w-full rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Upload a clear image of the item. Max file size: 5MB</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Item
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
