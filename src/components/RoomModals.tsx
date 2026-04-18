"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Room, CreateRoomData, UpdateRoomData } from "@/services/roomService";

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomData) => Promise<void>;
}

export const AddRoomModal = ({
  isOpen,
  onClose,
  onSubmit,
}: AddRoomModalProps) => {
  const [formData, setFormData] = useState<CreateRoomData & { facilities: string[] }>({
    roomNumber: "",
    roomName: "",
    roomType: "classroom",
    building: "",
    floor: "",
    seatingCapacity: 30,
    hasProjector: false,
    hasWhiteboard: true,
    hasComputers: false,
    computerCount: 0,
    hasAC: false,
    hasWifi: true,
    facilities: [],
    description: "",
  });

  const [facilityInput, setFacilityInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        roomNumber: "",
        roomName: "",
        roomType: "classroom",
        building: "",
        floor: "",
        seatingCapacity: 30,
        hasProjector: false,
        hasWhiteboard: true,
        hasComputers: false,
        computerCount: 0,
        hasAC: false,
        hasWifi: true,
        facilities: [],
        description: "",
      });
      setFacilityInput("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFacility = () => {
    if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, facilityInput.trim()],
      });
      setFacilityInput("");
    }
  };

  const removeFacility = (facility: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((f) => f !== facility),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Room
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., A101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Room Name *
              </label>
              <input
                type="text"
                required
                value={formData.roomName}
                onChange={(e) =>
                  setFormData({ ...formData, roomName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Computer Lab 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Room Type *
              </label>
              <select
                required
                value={formData.roomType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    roomType: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="classroom">Classroom</option>
                <option value="lab">Lab</option>
                <option value="lecture-hall">Lecture Hall</option>
                <option value="seminar-room">Seminar Room</option>
                <option value="auditorium">Auditorium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Building *
              </label>
              <input
                type="text"
                required
                value={formData.building}
                onChange={(e) =>
                  setFormData({ ...formData, building: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Academic Block A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Floor
              </label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., 1, Ground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seating Capacity *
              </label>
              <input
                type="number"
                required
                min="1"
                max="500"
                value={formData.seatingCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seatingCapacity: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Facilities */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Facilities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasProjector}
                  onChange={(e) =>
                    setFormData({ ...formData, hasProjector: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Projector
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasWhiteboard}
                  onChange={(e) =>
                    setFormData({ ...formData, hasWhiteboard: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Whiteboard
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasComputers}
                  onChange={(e) =>
                    setFormData({ ...formData, hasComputers: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Computers
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasAC}
                  onChange={(e) =>
                    setFormData({ ...formData, hasAC: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Air Conditioning
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasWifi}
                  onChange={(e) =>
                    setFormData({ ...formData, hasWifi: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  WiFi
                </span>
              </label>
            </div>

            {formData.hasComputers && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Computers
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.computerCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      computerCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Additional Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Facilities
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFacility())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Smart Board"
              />
              <button
                type="button"
                onClick={addFacility}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            {formData.facilities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {facility}
                    <button
                      type="button"
                      onClick={() => removeFacility(facility)}
                      className="hover:text-blue-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Additional information about the room..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateRoomData) => Promise<void>;
  room: Room | null;
}

export const EditRoomModal = ({
  isOpen,
  onClose,
  onSubmit,
  room,
}: EditRoomModalProps) => {
  const [formData, setFormData] = useState<UpdateRoomData & { facilities: string[] }>({
    facilities: [],
  });
  const [facilityInput, setFacilityInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber,
        roomName: room.roomName,
        roomType: room.roomType,
        building: room.building,
        floor: room.floor,
        seatingCapacity: room.seatingCapacity,
        hasProjector: room.hasProjector,
        hasWhiteboard: room.hasWhiteboard,
        hasComputers: room.hasComputers,
        computerCount: room.computerCount,
        hasAC: room.hasAC,
        hasWifi: room.hasWifi,
        facilities: [...room.facilities],
        description: room.description,
        isActive: room.isActive,
      });
    }
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error updating room:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFacility = () => {
    if (facilityInput.trim() && formData.facilities && !formData.facilities.includes(facilityInput.trim())) {
      setFormData({
        ...formData,
        facilities: [...(formData.facilities || []), facilityInput.trim()],
      });
      setFacilityInput("");
    }
  };

  const removeFacility = (facility: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities?.filter((f) => f !== facility) || [],
    });
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Room
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Same form fields as Add modal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                required
                value={formData.roomNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Room Name *
              </label>
              <input
                type="text"
                required
                value={formData.roomName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, roomName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Room Type *
              </label>
              <select
                required
                value={formData.roomType || "classroom"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    roomType: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="classroom">Classroom</option>
                <option value="lab">Lab</option>
                <option value="lecture-hall">Lecture Hall</option>
                <option value="seminar-room">Seminar Room</option>
                <option value="auditorium">Auditorium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Building *
              </label>
              <input
                type="text"
                required
                value={formData.building || ""}
                onChange={(e) =>
                  setFormData({ ...formData, building: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Floor
              </label>
              <input
                type="text"
                value={formData.floor || ""}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seating Capacity *
              </label>
              <input
                type="number"
                required
                min="1"
                max="500"
                value={formData.seatingCapacity || 30}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seatingCapacity: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Facilities */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Facilities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasProjector || false}
                  onChange={(e) =>
                    setFormData({ ...formData, hasProjector: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Projector
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasWhiteboard || false}
                  onChange={(e) =>
                    setFormData({ ...formData, hasWhiteboard: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Whiteboard
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasComputers || false}
                  onChange={(e) =>
                    setFormData({ ...formData, hasComputers: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Computers
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasAC || false}
                  onChange={(e) =>
                    setFormData({ ...formData, hasAC: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Air Conditioning
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasWifi || false}
                  onChange={(e) =>
                    setFormData({ ...formData, hasWifi: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  WiFi
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Active
                </span>
              </label>
            </div>

            {formData.hasComputers && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Computers
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.computerCount || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      computerCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Additional Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Facilities
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFacility())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Add facility"
              />
              <button
                type="button"
                onClick={addFacility}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            {formData.facilities && formData.facilities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {facility}
                    <button
                      type="button"
                      onClick={() => removeFacility(facility)}
                      className="hover:text-blue-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
