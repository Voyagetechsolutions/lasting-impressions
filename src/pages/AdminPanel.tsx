import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Users,
  ShoppingCart,
  Calendar,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  MessageSquare,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { useAdmin } from "@/contexts/AdminContext";
import ProductForm from "@/components/admin/ProductForm";
import ClassForm from "@/components/admin/ClassForm";
import { Product } from "@/contexts/AdminContext";

export default function AdminPanel() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    classes,
    bookings,
    updateBookingStatus,
    customRequests,
    contactMessages,
    getAnalytics
  } = useAdmin();



  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingSearchTerm, setBookingSearchTerm] = useState("");

  const analytics = getAnalytics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "reviewing":
        return "bg-blue-100 text-blue-800";
      case "quoted":
        return "bg-purple-100 text-purple-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "in_production":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING_WHATSAPP_CONFIRMATION":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBookingStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING_WHATSAPP_CONFIRMATION":
        return "Pending";
      case "CONFIRMED":
        return "Confirmed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status || "Unknown";
    }
  };

  const filteredBookings = bookings.filter((booking: any) => {
    const matchesStatus = bookingStatusFilter === "all" || booking.status === bookingStatusFilter;
    const matchesSearch = !bookingSearchTerm ||
      booking.booking_reference?.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
      `${booking.customer_first_name} ${booking.customer_last_name}`.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
      booking.class_name?.toLowerCase().includes(bookingSearchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsProductFormOpen(true);
  };

  const handleProductSubmit = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-2">
                Admin Panel
              </h1>
              <p className="text-muted-foreground">
                Manage your Lasting Impressions business
              </p>
            </div>
            <Button variant="hero" className="gap-2" onClick={handleAddProduct}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="h-4 w-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Requests
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R{analytics.totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Total revenue from orders</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">Total orders received</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalProducts}</div>
                    <p className="text-xs text-muted-foreground">Products in inventory</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Class Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalBookings}</div>
                    <p className="text-xs text-muted-foreground">Total class bookings</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest customer orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.recentOrders.length > 0 ? (
                        analytics.recentOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                              <p className="text-sm text-muted-foreground">{order.id}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">R{order.total.toFixed(2)}</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No orders yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Low Stock Alert</CardTitle>
                    <CardDescription>Products running low on inventory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.lowStockProducts.length > 0 ? (
                        analytics.lowStockProducts.map((product) => (
                          <div key={product.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{product.stock} left</p>
                              <Badge className={product.stock === 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                                {product.stock === 0 ? "Out of Stock" : "Low Stock"}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">All products well stocked</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
                <Button variant="hero" className="gap-2" onClick={handleAddProduct}>
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Order ID</th>
                          <th className="text-left p-4 font-medium">Customer</th>
                          <th className="text-left p-4 font-medium">Date</th>
                          <th className="text-left p-4 font-medium">Items</th>
                          <th className="text-left p-4 font-medium">Total</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            No orders yet
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
                <Button variant="hero" className="gap-2" onClick={handleAddProduct}>
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Product</th>
                          <th className="text-left p-4 font-medium">Category</th>
                          <th className="text-left p-4 font-medium">Price</th>
                          <th className="text-left p-4 font-medium">Stock</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <tr key={product.id} className="border-b">
                              <td className="p-4">
                                <p className="font-medium">{product.name}</p>
                              </td>
                              <td className="p-4">{product.category}</td>
                              <td className="p-4 font-medium">R{product.price.toFixed(2)}</td>
                              <td className="p-4">{product.stock}</td>
                              <td className="p-4">
                                <Badge className={product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                  {product.inStock ? "In Stock" : "Out of Stock"}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" title="View Product">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)} title="Edit Product">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)} title="Delete Product">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                              No products found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              {/* Classes Section */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-semibold">Classes</h2>
                <Button variant="hero" className="gap-2" onClick={() => setIsClassFormOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Class
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Title</th>
                          <th className="text-left p-4 font-medium">Level</th>
                          <th className="text-left p-4 font-medium">Date & Time</th>
                          <th className="text-left p-4 font-medium">Duration</th>
                          <th className="text-left p-4 font-medium">Price</th>
                          <th className="text-left p-4 font-medium">Spots</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classes.length > 0 ? (
                          classes.map((classItem: any) => (
                            <tr key={classItem.id} className="border-b">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {classItem.image_url && (
                                    <img src={classItem.image_url} alt={classItem.title} className="w-12 h-12 rounded object-cover" />
                                  )}
                                  <p className="font-medium">{classItem.title}</p>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-secondary rounded-full text-xs">
                                  {classItem.level || 'N/A'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div>
                                  <p>{classItem.date ? new Date(classItem.date).toLocaleDateString() : 'TBA'}</p>
                                  <p className="text-sm text-muted-foreground">{classItem.time || 'TBA'}</p>
                                </div>
                              </td>
                              <td className="p-4">{classItem.duration || 'N/A'}</td>
                              <td className="p-4 font-medium">R{parseFloat(classItem.price).toFixed(2)}</td>
                              <td className="p-4">
                                {classItem.spots_left || classItem.max_participants || 'N/A'} / {classItem.max_participants || 'N/A'}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" title="View Class">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" title="Edit Class">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" title="Delete Class">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                              No classes found. Click "Add Class" to create one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Records Section */}
              <div className="border-t border-border pt-8 mt-8">
                <h2 className="text-xl font-serif font-semibold mb-4">Booking Records</h2>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by reference, name or class..."
                        value={bookingSearchTerm}
                        onChange={(e) => setBookingSearchTerm(e.target.value)}
                        className="pl-10 w-72"
                      />
                    </div>
                    <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="PENDING_WHATSAPP_CONFIRMATION">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-4 font-medium">Reference</th>
                            <th className="text-left p-4 font-medium">Class</th>
                            <th className="text-left p-4 font-medium">Customer</th>
                            <th className="text-left p-4 font-medium">Phone</th>
                            <th className="text-left p-4 font-medium">Date</th>
                            <th className="text-left p-4 font-medium">Qty</th>
                            <th className="text-left p-4 font-medium">Total</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking: any) => (
                              <tr key={booking.id} className="border-b">
                                <td className="p-4">
                                  <span className="font-mono text-sm font-medium">
                                    {booking.booking_reference || 'N/A'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <p className="font-medium">{booking.class_name || 'N/A'}</p>
                                </td>
                                <td className="p-4">
                                  <p className="font-medium">
                                    {booking.customer_first_name} {booking.customer_last_name}
                                  </p>
                                </td>
                                <td className="p-4 text-sm">
                                  {booking.customer_phone || booking.customer_email || 'N/A'}
                                </td>
                                <td className="p-4 text-sm">
                                  {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-4 text-center">{booking.attendees || 1}</td>
                                <td className="p-4 font-medium">
                                  {booking.total_price ? `R${parseFloat(booking.total_price).toFixed(2)}` : 'N/A'}
                                </td>
                                <td className="p-4">
                                  <Badge className={getBookingStatusColor(booking.status)}>
                                    {getBookingStatusLabel(booking.status)}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-1">
                                    {booking.status !== 'CONFIRMED' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        title="Mark Confirmed"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {booking.status !== 'CANCELLED' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        title="Cancel Booking"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                {bookings.length === 0
                                  ? 'No bookings yet. Bookings will appear here when customers book classes.'
                                  : 'No bookings match your filters.'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>Update your business details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Business Name</label>
                      <Input defaultValue="Lasting Impressions" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input defaultValue="lastingimpressions2005@gmail.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input defaultValue="+27 76 852 0695" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Address</label>
                      <Input defaultValue="8 Simon Street, Rustivia, Germiston" />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Settings</CardTitle>
                    <CardDescription>Configure delivery options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Delivery Fee</label>
                      <Input defaultValue="150" type="number" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Free Delivery Threshold</label>
                      <Input defaultValue="2000" type="number" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Delivery Time</label>
                      <Input defaultValue="3-5 business days" />
                    </div>
                    <Button>Save Settings</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            {/* Custom Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Requests</CardTitle>
                  <CardDescription>Custom bead requests from customers</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Customer</th>
                          <th className="text-left p-4 font-medium">Description</th>
                          <th className="text-left p-4 font-medium">Bead Type</th>
                          <th className="text-left p-4 font-medium">Budget</th>
                          <th className="text-left p-4 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customRequests.length > 0 ? (
                          customRequests.map((request: any) => (
                            <tr key={request.id} className="border-b">
                              <td className="p-4">
                                <div>
                                  <p className="font-medium">{request.customer_name}</p>
                                  <p className="text-sm text-muted-foreground">{request.customer_email}</p>
                                  <p className="text-sm text-muted-foreground">{request.customer_phone}</p>
                                </div>
                              </td>
                              <td className="p-4 max-w-xs">
                                <p className="truncate" title={request.description}>
                                  {request.description}
                                </p>
                              </td>
                              <td className="p-4">{request.bead_type || 'N/A'}</td>
                              <td className="p-4">
                                {request.budget ? `R${parseFloat(request.budget).toFixed(2)}` : "Not specified"}
                              </td>
                              <td className="p-4">{new Date(request.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                              No custom requests found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Messages</CardTitle>
                  <CardDescription>Messages from contact form</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Name</th>
                          <th className="text-left p-4 font-medium">Email</th>
                          <th className="text-left p-4 font-medium">Phone</th>
                          <th className="text-left p-4 font-medium">Message</th>
                          <th className="text-left p-4 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactMessages.length > 0 ? (
                          contactMessages.map((message: any) => (
                            <tr key={message.id} className="border-b">
                              <td className="p-4 font-medium">{message.name}</td>
                              <td className="p-4">{message.email}</td>
                              <td className="p-4">{message.phone || 'N/A'}</td>
                              <td className="p-4 max-w-xs">
                                <p className="truncate" title={message.message}>
                                  {message.message}
                                </p>
                              </td>
                              <td className="p-4">{new Date(message.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                              No contact messages found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <ProductForm
            product={editingProduct}
            isOpen={isProductFormOpen}
            onClose={() => setIsProductFormOpen(false)}
            onSubmit={handleProductSubmit}
          />

          <ClassForm
            isOpen={isClassFormOpen}
            onClose={() => setIsClassFormOpen(false)}
            onSuccess={() => {
              setIsClassFormOpen(false);
              // Classes will auto-reload from AdminContext
            }}
          />
        </div>
      </section>
    </Layout>
  );
}
