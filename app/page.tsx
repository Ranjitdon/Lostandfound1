"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Clock, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Item {
  _id: string
  title: string
  description: string
  contactInfo: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    // Filter items based on search query
    if (searchQuery.trim() === "") {
      setFilteredItems(items)
    } else {
      const filtered = items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredItems(filtered)
    }
  }, [searchQuery, items])

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items")
      const result = await response.json()

      if (result.success) {
        setItems(result.data)
        setFilteredItems(result.data)
      } else {
        setError("Failed to fetch items")
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setError("Failed to load items. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading items...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Lost & Found</h1>
              <p className="text-muted-foreground mt-1">Help reunite lost items with their owners</p>
            </div>
            <Link href="/upload">
              <Button size="lg" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Report Item
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto max-w-md">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{searchQuery ? "No items found" : "No items yet"}</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? "Try adjusting your search terms" : "Be the first to report a lost or found item"}
              </p>
              {!searchQuery && (
                <Link href="/upload">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Report First Item
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <Link key={item._id} href={`/item/${item._id}`}>
                  <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={item.imageUrl || "/placeholder.svg?height=300&width=300"}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-balance">{truncateText(item.title, 50)}</CardTitle>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.createdAt)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-pretty">{truncateText(item.description, 100)}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
