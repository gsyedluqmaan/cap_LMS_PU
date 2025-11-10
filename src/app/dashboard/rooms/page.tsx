"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { AddRoomModal, EditRoomModal } from "@/components/RoomModals";
import roomService, { Room, CreateRoomData, UpdateRoomData } from "@/services/roomService";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Users,
  Wifi,
  Monitor,
  Wind,
  Computer,
  Filter,
} from "lucide-react";

export default function RoomsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user, page, searchTerm, roomTypeFilter, buildingFilter]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomService.getRooms({
        page,
        limit: 20,
        search: searchTerm,
        roomType: roomTypeFilter,
        building: buildingFilter,
      });
      setRooms(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (data: CreateRoomData) => {
    try {
      await roomService.createRoom(data);
      setShowAddModal(false);
      fetchRooms();
    } catch (error: any) {
      console.error("Error creating room:", error);
      alert(error.response?.data?.error || "Error creating room");
    }
  };

  const handleEditRoom = async (data: UpdateRoomData) => {
    if (!selectedRoom) return;
    try {
      await roomService.updateRoom(selectedRoom._id, data);
      setShowEditModal(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (error: any) {
      console.error("Error updating room:", error);
      alert(error.response?.data?.error || "Error updating room");
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await roomService.deleteRoom(roomId);
      fetchRooms();
    } catch (error: any) {
      console.error("Error deleting room:", error);
      alert(error.response?.data?.error || "Error deleting room");
    }
  };

  const getRoomTypeColor = (type: string) => {
    const colors: any = {
      lab: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      classroom: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "lecture-hall": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "seminar-room": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      auditorium: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[type] || colors.classroom;
  };

  const isAdmin = user?.role === "admin";

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Room Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all rooms and their facilities
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Add Room
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <select
                value={roomTypeFilter}
                onChange={(e) => {
                  setRoomTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="lab">Lab</option>
                <option value="classroom">Classroom</option>
                <option value="lecture-hall">Lecture Hall</option>
                <option value="seminar-room">Seminar Room</option>
                <option value="auditorium">Auditorium</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                placeholder="Filter by building"
                value={buildingFilter}
                onChange={(e) => {
                  setBuildingFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Rooms Grid/Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No rooms found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isAdmin
                ? "Get started by adding a new room."
                : "No rooms match your search criteria."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {room.roomNumber}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {room.roomName}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomTypeColor(
                        room.roomType
                      )}`}
                    >
                      {room.roomType}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{room.building}{room.floor ? `, Floor ${room.floor}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Capacity: {room.seatingCapacity}</span>
                    </div>
                  </div>

                  {/* Facilities Icons */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {room.hasProjector && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        <Monitor className="h-3 w-3" />
                        <span>Projector</span>
                      </div>
                    )}
                    {room.hasComputers && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        <Computer className="h-3 w-3" />
                        <span>{room.computerCount} PCs</span>
                      </div>
                    )}
                    {room.hasAC && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        <Wind className="h-3 w-3" />
                        <span>AC</span>
                      </div>
                    )}
                    {room.hasWifi && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        <Wifi className="h-3 w-3" />
                        <span>WiFi</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {isAdmin && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowEditModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddRoomModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRoom}
      />

      <EditRoomModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRoom(null);
        }}
        onSubmit={handleEditRoom}
        room={selectedRoom}
      />
    </DashboardLayout>
  );
}
