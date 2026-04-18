'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ClassSection, CreateClassSectionData, SubjectTeacher } from '@/services/classService';
import { User } from '@/services/userService';
import { Room } from '@/services/roomService';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClassSectionData) => Promise<void>;
  teachers: User[];
  rooms: Room[];
}

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<CreateClassSectionData>) => Promise<void>;
  classData: ClassSection;
  teachers: User[];
  rooms: Room[];
}

export function CreateClassModal({ isOpen, onClose, onSubmit, teachers, rooms }: CreateClassModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<CreateClassSectionData & { subjects: SubjectTeacher[] }>({
    className: '',
    classCode: '',
    description: '',
    subjects: [],
    department: '',
    semester: '',
    academicYear: '',
    students: [],
    maxStudents: 50,
    theoryRoom: '',
    labRoom: '',
    schedule: [],
    isActive: true,
  });

  const [currentSubject, setCurrentSubject] = useState<SubjectTeacher>({
    subject: '',
    teacher: '',
    hoursPerWeek: 0,
    sessionType: 'theory',
  });

  const theoryRooms = rooms.filter(r => 
    ['classroom', 'lecture-hall', 'seminar-room'].includes(r.roomType) && r.isActive
  );
  
  const labRooms = rooms.filter(r => 
    r.roomType === 'lab' && r.isActive && r.hasComputers
  );

  const handleAddSubject = () => {
    if (!currentSubject.subject || !currentSubject.teacher || currentSubject.hoursPerWeek <= 0) {
      setError('Please fill in all subject fields');
      return;
    }

    setFormData({
      ...formData,
      subjects: [...formData.subjects, { ...currentSubject }],
    });

    setCurrentSubject({
      subject: '',
      teacher: '',
      hoursPerWeek: 0,
      sessionType: 'theory',
    });
    setError('');
  };

  const handleRemoveSubject = (index: number) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.subjects.length === 0) {
      setError('Please add at least one subject');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        className: '',
        classCode: '',
        description: '',
        subjects: [],
        department: '',
        semester: '',
        academicYear: '',
        students: [],
        maxStudents: 50,
        theoryRoom: '',
        labRoom: '',
        schedule: [],
        isActive: true,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Class Section</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Computer Science 3rd Year"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class Code
                </label>
                <input
                  type="text"
                  value={formData.classCode}
                  onChange={(e) => setFormData({ ...formData, classCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department *
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Academic Year *
                </label>
                <input
                  type="text"
                  required
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 2024-2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Students *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="200"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Optional class description"
              />
            </div>

            {/* Room Allocation */}
            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">Room Allocation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Theory Room
                  </label>
                  <select
                    value={formData.theoryRoom}
                    onChange={(e) => setFormData({ ...formData, theoryRoom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Theory Room</option>
                    {theoryRooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.roomNumber} - {room.roomName} ({room.building}, Capacity: {room.seatingCapacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lab Room
                  </label>
                  <select
                    value={formData.labRoom}
                    onChange={(e) => setFormData({ ...formData, labRoom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Lab Room</option>
                    {labRooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.roomNumber} - {room.roomName} ({room.building}, {room.computerCount} PCs)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Subject Assignment */}
            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">Subject & Teacher Assignment</h3>
              
              {/* Current Subjects List */}
              {formData.subjects.length > 0 && (
                <div className="mb-4 space-y-2">
                  {formData.subjects.map((subject, index) => {
                    const teacher = teachers.find(t => t._id === subject.teacher);
                    return (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <div className="flex-1">
                          <span className="font-medium dark:text-white">{subject.subject}</span>
                          <span className="text-gray-600 dark:text-gray-400 mx-2">•</span>
                          <span className="text-gray-700 dark:text-gray-300">{teacher?.name || 'Unknown Teacher'}</span>
                          <span className="text-gray-600 dark:text-gray-400 mx-2">•</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {subject.hoursPerWeek}h/week ({subject.sessionType})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add New Subject Form */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={currentSubject.subject}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Data Structures"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teacher
                  </label>
                  <select
                    value={currentSubject.teacher}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, teacher: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hours/Week
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={currentSubject.hoursPerWeek || ''}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, hoursPerWeek: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={currentSubject.sessionType}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, sessionType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                    <option value="practical">Practical</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSubject}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors dark:text-white"
              >
                <Plus size={18} />
                Add Subject
              </button>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || formData.subjects.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Class Section'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function EditClassModal({ isOpen, onClose, onSubmit, classData, teachers, rooms }: EditClassModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<Partial<CreateClassSectionData> & { subjects: SubjectTeacher[] }>({
    className: classData.className,
    description: classData.description,
    subjects: classData.subjects,
    department: classData.department,
    semester: classData.semester,
    academicYear: classData.academicYear,
    maxStudents: classData.maxStudents,
    theoryRoom: typeof classData.theoryRoom === 'object' ? classData.theoryRoom?._id : classData.theoryRoom,
    labRoom: typeof classData.labRoom === 'object' ? classData.labRoom?._id : classData.labRoom,
    isActive: classData.isActive,
  });

  const [currentSubject, setCurrentSubject] = useState<SubjectTeacher>({
    subject: '',
    teacher: '',
    hoursPerWeek: 0,
    sessionType: 'theory',
  });

  const theoryRooms = rooms.filter(r => 
    ['classroom', 'lecture-hall', 'seminar-room'].includes(r.roomType) && r.isActive
  );
  
  const labRooms = rooms.filter(r => 
    r.roomType === 'lab' && r.isActive && r.hasComputers
  );

  const handleAddSubject = () => {
    if (!currentSubject.subject || !currentSubject.teacher || currentSubject.hoursPerWeek <= 0) {
      setError('Please fill in all subject fields');
      return;
    }

    setFormData({
      ...formData,
      subjects: [...(formData.subjects || []), { ...currentSubject }],
    });

    setCurrentSubject({
      subject: '',
      teacher: '',
      hoursPerWeek: 0,
      sessionType: 'theory',
    });
    setError('');
  };

  const handleRemoveSubject = (index: number) => {
    setFormData({
      ...formData,
      subjects: formData.subjects?.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subjects || formData.subjects.length === 0) {
      setError('Please add at least one subject');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onSubmit(classData._id, formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update class');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-white">Edit Class Section</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class Code
                </label>
                <input
                  type="text"
                  value={classData.classCode}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 cursor-not-allowed dark:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department *
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem.toString()}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Academic Year *
                </label>
                <input
                  type="text"
                  required
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Students *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="200"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Room Allocation */}
            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">Room Allocation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Theory Room
                  </label>
                  <select
                    value={formData.theoryRoom || ''}
                    onChange={(e) => setFormData({ ...formData, theoryRoom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Theory Room</option>
                    {theoryRooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.roomNumber} - {room.roomName} ({room.building}, Capacity: {room.seatingCapacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lab Room
                  </label>
                  <select
                    value={formData.labRoom || ''}
                    onChange={(e) => setFormData({ ...formData, labRoom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Lab Room</option>
                    {labRooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.roomNumber} - {room.roomName} ({room.building}, {room.computerCount} PCs)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Subject Assignment */}
            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">Subject & Teacher Assignment</h3>
              
              {/* Current Subjects List */}
              {formData.subjects && formData.subjects.length > 0 && (
                <div className="mb-4 space-y-2">
                  {formData.subjects.map((subject, index) => {
                    const teacherId = typeof subject.teacher === 'object' ? subject.teacher._id : subject.teacher;
                    const teacher = teachers.find(t => t._id === teacherId);
                    return (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <div className="flex-1">
                          <span className="font-medium dark:text-white">{subject.subject}</span>
                          <span className="text-gray-600 dark:text-gray-400 mx-2">•</span>
                          <span className="text-gray-700 dark:text-gray-300">{teacher?.name || 'Unknown Teacher'}</span>
                          <span className="text-gray-600 dark:text-gray-400 mx-2">•</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {subject.hoursPerWeek}h/week ({subject.sessionType})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add New Subject Form */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={currentSubject.subject}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Data Structures"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teacher
                  </label>
                  <select
                    value={currentSubject.teacher}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, teacher: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hours/Week
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={currentSubject.hoursPerWeek || ''}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, hoursPerWeek: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={currentSubject.sessionType}
                    onChange={(e) => setCurrentSubject({ ...currentSubject, sessionType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                    <option value="practical">Practical</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSubject}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors dark:text-white"
              >
                <Plus size={18} />
                Add Subject
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Class is Active
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.subjects || formData.subjects.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Class Section'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
