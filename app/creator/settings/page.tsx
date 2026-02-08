'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useMyCreatorSettings, 
  useUpdateCreatorSettings,
  type CreatorSettings 
} from '@/lib/api/users';
import { useToast } from '@/lib/store';
import Button from '@/components/Button';
import { Input } from '@/components/Input';
import { 
  Loader2, 
  Save, 
  Globe, 
  Briefcase, 
  FileText, 
  Tags,
  X,
  Plus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function CreatorSettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  // Fetch current settings
  const { data: settings, isLoading, error } = useMyCreatorSettings();
  const updateSettings = useUpdateCreatorSettings();
  
  // Form state
  const [formData, setFormData] = useState<CreatorSettings>({
    bio: '',
    professionalBackground: '',
    expertise: [],
    portfolioUrl: '',
  });
  
  // Expertise input state
  const [expertiseInput, setExpertiseInput] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof CreatorSettings, string>>>({});
  
  // Initialize form with existing data
  useEffect(() => {
    if (settings?.creatorProfiles) {
      setFormData({
        bio: settings.creatorProfiles.bio || '',
        professionalBackground: settings.creatorProfiles.professionalBackground || '',
        expertise: settings.creatorProfiles.expertise || [],
        portfolioUrl: settings.creatorProfiles.portfolioUrl || '',
      });
    }
  }, [settings]);
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreatorSettings, string>> = {};
    
    // Bio validation (max 1000 chars)
    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = 'Bio must be less than 1000 characters';
    }
    
    // Portfolio URL validation
    if (formData.portfolioUrl) {
      try {
        new URL(formData.portfolioUrl);
      } catch {
        newErrors.portfolioUrl = 'Please enter a valid URL';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }
    
    try {
      await updateSettings.mutateAsync(formData);
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      showToast(error?.response?.data?.error?.message || 'Failed to update profile', 'error');
    }
  };
  
  // Add expertise tag
  const addExpertise = () => {
    const trimmed = expertiseInput.trim();
    if (trimmed && !formData.expertise.includes(trimmed)) {
      if (formData.expertise.length >= 10) {
        showToast('Maximum 10 expertise tags allowed', 'error');
        return;
      }
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, trimmed]
      }));
      setExpertiseInput('');
    }
  };
  
  // Remove expertise tag
  const removeExpertise = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(t => t !== tag)
    }));
  };
  
  // Handle expertise input keydown
  const handleExpertiseKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExpertise();
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Failed to load settings</h3>
          <p className="text-red-600 mb-4">Please try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Creator Settings</h1>
        <p className="text-gray-500 mt-2">Manage your public profile information</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bio Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bio</h2>
              <p className="text-sm text-gray-500">Tell your story and showcase your expertise</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself, your background, and what you create..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{formData.bio.length}/1000 characters</span>
              {errors.bio && <span className="text-red-500">{errors.bio}</span>}
            </div>
          </div>
        </section>
        
        {/* Professional Background Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Professional Background</h2>
              <p className="text-sm text-gray-500">Your professional title or background</p>
            </div>
          </div>
          
          <input
            type="text"
            value={formData.professionalBackground}
            onChange={(e) => setFormData(prev => ({ ...prev, professionalBackground: e.target.value }))}
            placeholder="e.g., Full Stack Developer, UI/UX Designer"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </section>
        
        {/* Expertise Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Tags className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Expertise</h2>
              <p className="text-sm text-gray-500">Add tags to showcase your skills (max 10)</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyDown={handleExpertiseKeyDown}
                placeholder="e.g., React, Node.js, Design"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addExpertise}
                disabled={!expertiseInput.trim()}
                className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.expertise.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeExpertise(tag)}
                    className="ml-1 p-0.5 hover:bg-blue-100 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="text-sm text-gray-400">
              Press Enter to add a tag • {formData.expertise.length}/10 tags
            </div>
          </div>
        </section>
        
        {/* Portfolio URL Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Globe className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Portfolio URL</h2>
              <p className="text-sm text-gray-500">Link to your portfolio or personal website</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <input
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
              placeholder="https://your-portfolio.com"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.portfolioUrl ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.portfolioUrl && (
              <p className="text-sm text-red-500">{errors.portfolioUrl}</p>
            )}
          </div>
        </section>
        
        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/creator')}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
          
          <Button
            type="submit"
            disabled={updateSettings.isPending}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updateSettings.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
