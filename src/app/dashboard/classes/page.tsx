'use client';

import { useState, useEffect } from 'react';
import { useAuth, checkPermission } from '@/lib/auth';
import { classSectionService, ClassSection } from '@/services/classService';
import userService from '@/services/userService';
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
  Calendar
} from 'lucide-react';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  classData?: ClassSection | null;
  isLoading: boolean;
  error: string;
}

const ClassModal: React.FC<ClassModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  classData, 
  isLoading, 
  error 
}) => {
  const [formData, setFormData] = useState({
    className: '',
    classCode: '',
    description: '',
    subject: '',
    department: '',
    semester: '',
    academicYear: new Date().getFullYear().toString(),
    maxStudents: 50,
    schedule: [{
      days: [] as string[],
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      building: ''
    }]
  });

  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const departments = ['Computer Science', 'Engineering', 'Business', 'Mathematics', 'Physics', 'Chemistry'];

  useEffect(() => {
    if (isOpen) {
      loadUsersData();
      if (classData) {
        setFormData({
          className: classData.className,
          classCode: classData.classCode,
          description: classData.description || '',
          subject: classData.subject || '',
          department: classData.department,
          semester: classData.semester || '',
          academicYear: classData.academicYear,
          maxStudents: classData.maxStudents,
          schedule: classData.schedule.length > 0 ? classData.schedule.map(s => ({
            ...s,
            room: s.room || '',
            building: s.building || ''
          })) : [{ days: [], startTime: '09:00', endTime: '10:00', room: '', building: '' }]
        });
        setSelectedTeachers(classData.teachers.map((t: any) => typeof t === 'string' ? t : t._id));
        setSelectedStudents(classData.students.map((s: any) => typeof s === 'string' ? s : s._id));
      } else {
        resetForm();
      }
    }
  }, [isOpen, classData]);

  const loadUsersData = async () => {
    try {
      const [teachersData, studentsData] = await Promise.all([
        userService.getTeachers({ limit: 100 }),
        userService.getStudents({ limit: 100 })
      ]);
      setTeachers(teachersData.data);
      setStudents(studentsData.data);
    } catch (error) {
      console.error('Failed to load users data:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      className: '',
      classCode: '',
      description: '',
      subject: '',
      department: '',
      semester: '',
      academicYear: new Date().getFullYear().toString(),
      maxStudents: 50,
      schedule: [{ days: [], startTime: '09:00', endTime: '10:00', room: '', building: '' }]
    });
    setSelectedTeachers([]);
    setSelectedStudents([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      teachers: selectedTeachers,
      students: selectedStudents
    });
  };

  const handleDayToggle = (scheduleIndex: number, day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((sched, index) => {
        if (index === scheduleIndex) {
          const days = sched.days.includes(day)
            ? sched.days.filter(d => d !== day)
            : [...sched.days, day];
          return { ...sched, days };
        }
        return sched;
      })
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {classData ? 'Edit Class' : 'Create New Class'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Class Name *
              </label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Class Code (Optional)
              </label>
              <input
                type="text"
                value={formData.classCode || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, classCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., CS101A (auto-generated if empty)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to auto-generate a unique class code
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Academic Year *
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., 2024-2025"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Semester
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Fall 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Students *
              </label>
              <input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                min="1"
                max="200"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Schedule */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Schedule</h3>
            {formData.schedule.map((sched, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Days of Week
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(index, day)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          sched.days.includes(day)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={sched.startTime}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        schedule: prev.schedule.map((s, i) => 
                          i === index ? { ...s, startTime: e.target.value } : s
                        )
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={sched.endTime}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        schedule: prev.schedule.map((s, i) => 
                          i === index ? { ...s, endTime: e.target.value } : s
                        )
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Room
                    </label>
                    <input
                      type="text"
                      value={sched.room}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        schedule: prev.schedule.map((s, i) => 
                          i === index ? { ...s, room: e.target.value } : s
                        )
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 101"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Building
                    </label>
                    <input
                      type="text"
                      value={sched.building}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        schedule: prev.schedule.map((s, i) => 
                          i === index ? { ...s, building: e.target.value } : s
                        )
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Science Block"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Teachers Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign Teachers
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto">
              {teachers.map((teacher: any) => (
                <label key={teacher._id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTeachers.includes(teacher._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTeachers(prev => [...prev, teacher._id]);
                      } else {
                        setSelectedTeachers(prev => prev.filter(id => id !== teacher._id));
                      }
                    }}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{teacher.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{teacher.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Students Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign Students
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto">
              {students.map((student: any) => (
                <label key={student._id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={(e) => {
                      if (e.target.checked && selectedStudents.length < formData.maxStudents) {
                        setSelectedStudents(prev => [...prev, student._id]);
                      } else if (!e.target.checked) {
                        setSelectedStudents(prev => prev.filter(id => id !== student._id));
                      }
                    }}
                    disabled={!selectedStudents.includes(student._id) && selectedStudents.length >= formData.maxStudents}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{student.email}</div>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Selected: {selectedStudents.length} / {formData.maxStudents}
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : classData ? 'Update Class' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ClassesPage() {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

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
        (cls.subject && cls.subject.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleCreateClass = async (classData: any) => {
    try {
      setModalLoading(true);
      setModalError('');
      await classSectionService.createClassSection(classData);
      await fetchClasses();
      setShowModal(false);
      setSelectedClass(null);
    } catch (error: any) {
      setModalError(error.response?.data?.error || 'Failed to create class');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateClass = async (classData: any) => {
    try {
      if (!selectedClass) return;
      setModalLoading(true);
      setModalError('');
      await classSectionService.updateClassSection(selectedClass._id, classData);
      await fetchClasses();
      setShowModal(false);
      setSelectedClass(null);
    } catch (error: any) {
      setModalError(error.response?.data?.error || 'Failed to update class');
    } finally {
      setModalLoading(false);
    }
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
    setShowModal(true);
  };

  const openEditModal = (classItem: ClassSection) => {
    setSelectedClass(classItem);
    setModalError('');
    setShowModal(true);
  };

  const canCreateClass = user?.role === 'admin';
  const canEditClass = (classItem: ClassSection) => {
    return user?.role === 'admin' || 
           (user?.role === 'teacher' && classItem.teachers.some((t: any) => 
             (typeof t === 'string' ? t : t._id) === user._id
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
                      {classItem.subject && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          {classItem.subject}
                        </p>
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
                      <span>{Array.isArray(classItem.teachers) ? classItem.teachers.length : 0} teachers</span>
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

        {/* Modal */}
        <ClassModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedClass(null);
            setModalError('');
          }}
          onSubmit={selectedClass ? handleUpdateClass : handleCreateClass}
          classData={selectedClass}
          isLoading={modalLoading}
          error={modalError}
        />
      </div>
    </div>
  );
}