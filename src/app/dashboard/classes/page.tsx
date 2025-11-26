'use client';

import { useState, useEffect } from 'react';
import { useAuth, checkPermission } from '@/lib/auth';
import { classSectionService, ClassSection, CreateClassSectionData } from '@/services/classService';
import userService, { User } from '@/services/userService';
import roomService, { Room } from '@/services/roomService';
import { CreateClassModal, EditClassModal } from '@/components/ClassModals';
import Link from 'next/link';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users, 
  UserCheck, 
  Clock,
  MapPin,
  GraduationCap,
  Eye,
  Calendar,
  DoorOpen
} from 'lucide-react';

export default function ClassesPage() {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassSection[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Load teachers and rooms when component mounts
  useEffect(() => {
    if (user) {
      fetchClasses();
      loadTeachersAndRooms();
    }
  }, [user]);

  const loadTeachersAndRooms = async () => {
    try {
      const [teachersData, roomsData] = await Promise.all([
        userService.getTeachers({ limit: 1000 }),
        roomService.getRooms({ limit: 1000, isActive: true }),
      ]);
      setTeachers(teachersData.data);
      setRooms(roomsData.data);
    } catch (err) {
      console.error('Error loading teachers and rooms:', err);
    }
  };

  useEffect(() => {
    filterClasses();
  }, [classes, searchTerm, departmentFilter, yearFilter]);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (user?.role === 'admin') {
        response = await classSectionService.getClassSections({ limit: 100 });
        setClasses(response.data);
      } else {
        const userClasses = await classSectionService.getUserClassSections(
          user!._id, 
          user!.role as 'student' | 'teacher'
        );
        setClasses(userClasses);
      }
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch classes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = [...classes];

    if (searchTerm) {
      filtered = filtered.filter(cls =>
        cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cls.subjects && cls.subjects.some(s => s.subject.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(cls => cls.department === departmentFilter);
    }

    if (yearFilter) {
      filtered = filtered.filter(cls => cls.academicYear === yearFilter);
    }

    setFilteredClasses(filtered);
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    try {
      await classSectionService.deleteClassSection(classId);
      await fetchClasses();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete class');
    }
  };

  const openCreateModal = () => {
    setSelectedClass(null);
    setModalError('');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (classItem: ClassSection) => {
    setSelectedClass(classItem);
    setModalError('');
    setIsEditModalOpen(true);
  };

  const handleCreateClass = async (data: CreateClassSectionData) => {
    setModalLoading(true);
    setModalError('');
    try {
      await classSectionService.createClassSection(data);
      setIsCreateModalOpen(false);
      fetchClasses(); // Refresh the list
    } catch (err: any) {
      setModalError(err.response?.data?.error || err.message || 'Failed to create class');
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateClass = async (id: string, data: Partial<CreateClassSectionData>) => {
    setModalLoading(true);
    setModalError('');
    try {
      await classSectionService.updateClassSection(id, data);
      setIsEditModalOpen(false);
      fetchClasses(); // Refresh the list
    } catch (err: any) {
      setModalError(err.response?.data?.error || err.message || 'Failed to update class');
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const canCreateClass = user?.role === 'admin';
  const canEditClass = (classItem: ClassSection) => {
    return user?.role === 'admin' || 
           (user?.role === 'teacher' && classItem.subjects.some((s: any) => 
             (typeof s.teacher === 'string' ? s.teacher : s.teacher._id) === user._id
           ));
  };
  const canDeleteClass = user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const uniqueDepartments = Array.from(new Set(classes.map(cls => cls.department)));
  const uniqueYears = Array.from(new Set(classes.map(cls => cls.academicYear)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Classes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {user?.role === 'admin' && 'Manage all classes and sections'}
                {user?.role === 'teacher' && 'View and manage your assigned classes'}
                {user?.role === 'student' && 'View your enrolled classes'}
              </p>
            </div>
            {canCreateClass && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create Class
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Classes Grid */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading classes...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No classes found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {canCreateClass ? 'Get started by creating your first class.' : 'No classes have been assigned to you yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem) => (
              <div key={classItem._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {classItem.className}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {classItem.classCode} • {classItem.department}
                      </p>
                      {classItem.subjects && classItem.subjects.length > 0 && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          {classItem.subjects.map(s => s.subject).slice(0, 3).join(', ')}
                          {classItem.subjects.length > 3 && ` +${classItem.subjects.length - 3} more`}
                        </p>
                      )}
                      {classItem.theoryRoom && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <DoorOpen className="h-3 w-3 mr-1" />
                          Theory: {typeof classItem.theoryRoom === 'object' ? classItem.theoryRoom.roomNumber : 'N/A'}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <Link href={`/dashboard/classes/${classItem._id}`}>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                      {canEditClass(classItem) && (
                        <button
                          onClick={() => openEditModal(classItem)}
                          className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {canDeleteClass && (
                        <button
                          onClick={() => handleDeleteClass(classItem._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {classItem.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {classItem.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{classItem.currentEnrollment} / {classItem.maxStudents} students</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <UserCheck className="h-4 w-4 mr-2" />
                      <span>{Array.isArray(classItem.subjects) ? classItem.subjects.length : 0} subjects</span>
                    </div>
                    
                    {classItem.schedule.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {classItem.schedule[0].days.join(', ')} • {classItem.schedule[0].startTime} - {classItem.schedule[0].endTime}
                        </span>
                      </div>
                    )}
                    
                    {classItem.schedule.length > 0 && (classItem.schedule[0].room || classItem.schedule[0].building) && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {[classItem.schedule[0].room, classItem.schedule[0].building].filter(Boolean).join(', ') || 'TBA'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{classItem.academicYear}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <CreateClassModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setModalError('');
          }}
          onSubmit={handleCreateClass}
          teachers={teachers}
          rooms={rooms}
        />

        {/* Edit Modal */}
        {selectedClass && (
          <EditClassModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedClass(null);
              setModalError('');
            }}
            onSubmit={handleUpdateClass}
            classData={selectedClass}
            teachers={teachers}
            rooms={rooms}
          />
        )}
      </div>
    </div>
  );
}