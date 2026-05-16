import { Upload, Image, Loader2, HelpCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/layouts/DashboardLayout";
import { AppSelect } from "@/components/ui/app-select";
import { categoryApi } from "@/lib/categories-api";
import { coursesApi, sectionsApi, lessonsApi } from "@/lib/courses-api";
import { SectionForm } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { DropResult } from "@hello-pangea/dnd";
import CourseContentEditor from "@/components/CourseContentEditor";
import { getMediaUrl } from "@/lib/utils";

const UploadCourse = ({ isEditOverride = false }: { isEditOverride?: boolean }) => {
  const { id: paramId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const editCourse = location.state as any;
  const isEditMode = isEditOverride || !!paramId;
  const courseId = paramId || editCourse?.course_id || editCourse?.id;

  const [publishing, setPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [price, setPrice] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const [sections, setSections] = useState<SectionForm[]>([
    { title: "Introduction", lessons: [{ title: "Welcome", description: "", video: null, isNew: true }], isNew: true }
  ]);

  const [deletedSections, setDeletedSections] = useState<{ course_id: number, section_order: number }[]>([]);
  const [deletedLessons, setDeletedLessons] = useState<{ course_id: number, section_order: number, lesson_order: number }[]>([]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getAll(),
  });

  const { isLoading: isCourseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const courseData = await coursesApi.getById(Number(courseId));
      setTitle(courseData.title);
      setDescription(courseData.description);
      setCategoryId(courseData.category_id.toString());
      setLevel(courseData.level);
      setPrice(courseData.price || "");
      setOriginalPrice(courseData.original_price);
      setIsAvailable(courseData.is_available);
      setThumbnailPreview(courseData.thumbnail_url);

      const content = await coursesApi.getCourseContent(Number(courseId));
      if (content && content.sections) {
        setSections(content.sections.map(s => ({
          title: s.title,
          original_section_order: s.section_order,
          isNew: false,
          lessons: s.lessons.map(l => ({
            title: l.title,
            description: l.description || "",
            video: null,
            video_url: l.video_url,
            isNew: false,
            original_lesson_order: l.lesson_order,
            original_section_order: s.section_order
          }))
        })));
      }

      return courseData;
    },
    enabled: isEditMode && !!courseId,
  });

  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSection = () => {
    setSections([...sections, { title: "", lessons: [{ title: "", description: "", video: null, isNew: true }], isNew: true }]);
  };

  const addLesson = (sectionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].lessons.push({ title: "", description: "", video: null, isNew: true });
    setSections(updated);
  };

  const removeSection = (index: number) => {
    const sectionToRemove = sections[index];
    if (!sectionToRemove.isNew && courseId) {
      setDeletedSections([...deletedSections, { course_id: Number(courseId), section_order: sectionToRemove.original_section_order! }]);
    }
    setSections(sections.filter((_, i) => i !== index));
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    const lessonToRemove = sections[sectionIndex].lessons[lessonIndex];
    if (!lessonToRemove.isNew && courseId) {
      setDeletedLessons([...deletedLessons, { 
        course_id: Number(courseId), 
        section_order: sections[sectionIndex].original_section_order!, 
        lesson_order: lessonToRemove.original_lesson_order! 
      }]);
    }
    const updated = [...sections];
    updated[sectionIndex].lessons = updated[sectionIndex].lessons.filter((_, i) => i !== lessonIndex);
    setSections(updated);
  };

  const handleLessonVideoChange = (sectionIndex: number, lessonIndex: number, file: File) => {
    const updated = [...sections];
    updated[sectionIndex].lessons[lessonIndex].video = file;
    setSections(updated);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "section") {
      const newSections = Array.from(sections);
      const [reorderedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, reorderedSection);
      setSections(newSections);
    } else if (type === "lesson") {
      const sourceSectionIndex = parseInt(source.droppableId.split("-")[1]);
      const destSectionIndex = parseInt(destination.droppableId.split("-")[1]);
      
      const newSections = Array.from(sections);
      const [reorderedLesson] = newSections[sourceSectionIndex].lessons.splice(source.index, 1);
      newSections[destSectionIndex].lessons.splice(destination.index, 0, reorderedLesson);
      setSections(newSections);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !description.trim() || !categoryId || !level || originalPrice === "") {
      toast({ title: "Validation Error", description: "Please fill in all required basic information", variant: "destructive" });
      return;
    }

    if (!isEditMode && !thumbnail) {
      toast({ title: "Validation Error", description: "Please upload a course thumbnail", variant: "destructive" });
      return;
    }

    if (sections.length === 0) {
      toast({ title: "Validation Error", description: "Please add at least one section to your course", variant: "destructive" });
      return;
    }

    for (let si = 0; si < sections.length; si++) {
      const section = sections[si];
      if (!section.title.trim()) {
        toast({ title: "Validation Error", description: `Section ${si + 1} is missing a title`, variant: "destructive" });
        return;
      }
      if (section.lessons.length === 0) {
        toast({ title: "Validation Error", description: `Section "${section.title}" must have at least one lesson`, variant: "destructive" });
        return;
      }
      for (let li = 0; li < section.lessons.length; li++) {
        const lesson = section.lessons[li];
        if (!lesson.title.trim()) {
          toast({ title: "Validation Error", description: `Lesson ${li + 1} in section "${section.title}" is missing a title`, variant: "destructive" });
          return;
        }
        if (!lesson.video && !lesson.video_url) {
          toast({ title: "Validation Error", description: `Please upload a video for lesson "${lesson.title}" in section "${section.title}"`, variant: "destructive" });
          return;
        }
      }
    }

    setPublishing(true);
    try {
      setPublishProgress(isEditMode ? "Updating course..." : "Creating course...");
      const courseFormData = new FormData();
      courseFormData.append("title", title);
      courseFormData.append("description", description);
      courseFormData.append("category_id", categoryId);
      courseFormData.append("level", level);
      courseFormData.append("original_price", originalPrice.toString());
      courseFormData.append("is_available", isAvailable ? "true" : "false");
      if (price !== "") courseFormData.append("price", price.toString());
      if (thumbnail) courseFormData.append("thumbnail", thumbnail);

      let publishedCourseId: number;
      if (isEditMode) {
        const updatedCourse = await coursesApi.update(Number(courseId), courseFormData);
        publishedCourseId = updatedCourse.course_id || Number(courseId);
      } else {
        const newCourse = await coursesApi.create(courseFormData);
        publishedCourseId = newCourse.course_id;
      }

      if (isEditMode) {
        for (const dl of deletedLessons) {
          await lessonsApi.delete(dl.course_id, dl.section_order, dl.lesson_order).catch(console.error);
        }
        for (const ds of deletedSections) {
          await sectionsApi.delete(ds.course_id, ds.section_order).catch(console.error);
        }

        for (let si = 0; si < sections.length; si++) {
          for (let li = 0; li < sections[si].lessons.length; li++) {
            const lesson = sections[si].lessons[li];
            if (!lesson.isNew && lesson.original_section_order && lesson.original_lesson_order) {
              const tempLessonOrder = lesson.original_lesson_order + 1000;
              const lessonFormData = new FormData();
              lessonFormData.append("lesson_order", tempLessonOrder.toString());
              await lessonsApi.update(publishedCourseId, lesson.original_section_order, lesson.original_lesson_order, lessonFormData);
              lesson.original_lesson_order = tempLessonOrder;
            }
          }
        }

        for (let si = 0; si < sections.length; si++) {
          const section = sections[si];
          if (!section.isNew && section.original_section_order) {
            const oldSectionOrder = section.original_section_order;
            const tempSectionOrder = oldSectionOrder + 1000;
            
            await sectionsApi.update(publishedCourseId, oldSectionOrder, { section_order: tempSectionOrder, title: section.title });
            section.original_section_order = tempSectionOrder;

            for (let ssi = 0; ssi < sections.length; ssi++) {
              for (let lli = 0; lli < sections[ssi].lessons.length; lli++) {
                const l = sections[ssi].lessons[lli];
                if (!l.isNew && l.original_section_order === oldSectionOrder) {
                  l.original_section_order = tempSectionOrder;
                }
              }
            }
          }
        }

        for (let si = 0; si < sections.length; si++) {
          const section = sections[si];
          const newSectionOrder = si + 1;

          if (section.isNew) {
            setPublishProgress(`Adding section: ${section.title}...`);
            await sectionsApi.create({ course_id: publishedCourseId, section_order: newSectionOrder, title: section.title });
          } else {
            setPublishProgress(`Updating section: ${section.title}...`);
            const oldTempSectionOrder = section.original_section_order!;
            await sectionsApi.update(publishedCourseId, oldTempSectionOrder, { section_order: newSectionOrder, title: section.title });
            section.original_section_order = newSectionOrder;

            for (let ssi = 0; ssi < sections.length; ssi++) {
              for (let lli = 0; lli < sections[ssi].lessons.length; lli++) {
                const l = sections[ssi].lessons[lli];
                if (!l.isNew && l.original_section_order === oldTempSectionOrder) {
                  l.original_section_order = newSectionOrder;
                }
              }
            }
          }

          for (let li = 0; li < section.lessons.length; li++) {
            const lesson = section.lessons[li];
            const newLessonOrder = li + 1;

            if (lesson.isNew) {
              setPublishProgress(`Uploading new lesson: ${lesson.title}...`);
              const lessonFormData = new FormData();
              lessonFormData.append("course_id", publishedCourseId.toString());
              lessonFormData.append("section_order", newSectionOrder.toString());
              lessonFormData.append("lesson_order", newLessonOrder.toString());
              lessonFormData.append("title", lesson.title);
              lessonFormData.append("description", lesson.description || "");
              if (lesson.video) lessonFormData.append("video", lesson.video);
              await lessonsApi.create(lessonFormData);
            } else {
              setPublishProgress(`Updating lesson: ${lesson.title}...`);
              const lessonFormData = new FormData();
              lessonFormData.append("title", lesson.title);
              lessonFormData.append("description", lesson.description || "");
              lessonFormData.append("section_order", newSectionOrder.toString());
              lessonFormData.append("lesson_order", newLessonOrder.toString());
              if (lesson.video) lessonFormData.append("video", lesson.video);
              await lessonsApi.update(publishedCourseId, lesson.original_section_order!, lesson.original_lesson_order!, lessonFormData);
            }
          }
        }
      } else {
        for (let si = 0; si < sections.length; si++) {
          const section = sections[si];
          setPublishProgress(`Creating section ${si + 1}...`);
          await sectionsApi.create({ course_id: publishedCourseId, section_order: si + 1, title: section.title });
          for (let li = 0; li < section.lessons.length; li++) {
            const lesson = section.lessons[li];
            setPublishProgress(`Uploading lesson ${li + 1}...`);
            const lessonFormData = new FormData();
            lessonFormData.append("course_id", publishedCourseId.toString());
            lessonFormData.append("section_order", (si + 1).toString());
            lessonFormData.append("lesson_order", (li + 1).toString());
            lessonFormData.append("title", lesson.title);
            lessonFormData.append("description", lesson.description);
            if (lesson.video) lessonFormData.append("video", lesson.video);
            await lessonsApi.create(lessonFormData);
          }
        }
      }

      toast({ title: "Success", description: `Course ${isEditMode ? "updated" : "published"} successfully!` });
      navigate("/instructor/courses");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to publish course", variant: "destructive" });
    } finally {
      setPublishing(false);
      setPublishProgress("");
    }
  };

  if (isEditMode && isCourseLoading) {
    return (
      <DashboardLayout type="instructor">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="instructor">
      <div className="mb-8">
        <h1 className="text-h1 text-foreground">{isEditMode ? "Edit Course" : "Upload Course"}</h1>
        <p className="text-body text-muted-foreground mt-1">{isEditMode ? "Update your course details" : "Create and publish a new course"}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-card card-shadow p-6">
            <h2 className="text-h3 text-card-foreground mb-5">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-small font-medium text-foreground block mb-1.5">Course Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Complete Web Development Bootcamp" className="w-full px-4 py-2.5 text-small border border-border outline-none rounded-button focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="text-small font-medium text-foreground block mb-1.5">Short Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief overview of your course..." rows={3} className="w-full px-4 py-2.5 text-small border border-border outline-none rounded-button focus:ring-2 focus:ring-primary/20 resize-none transition-all" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-small font-medium text-foreground block mb-1.5">Category</label>
                  <AppSelect options={(categories || []).map(c => ({ value: c.category_id.toString(), label: c.name }))} value={categoryId} onValueChange={setCategoryId} placeholder="Select category" triggerClassName="px-4 py-2.5 hover:bg-muted/50 transition-colors" />
                </div>
                <div>
                  <label className="text-small font-medium text-foreground block mb-1.5">Level</label>
                  <AppSelect options={["Beginner", "Intermediate", "Advanced"]} value={level} onValueChange={(val) => setLevel(val as any)} placeholder="Select level" triggerClassName="px-4 py-2.5 hover:bg-muted/50 transition-colors" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-small font-medium text-foreground block mb-1.5">Original Price ($)</label>
                  <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : "")} placeholder="99.99" className="w-full px-4 py-2.5 text-small border border-border outline-none rounded-button focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="text-small font-medium text-foreground block mb-1.5">Discounted Price ($) (Optional)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")} placeholder="49.99" className="w-full px-4 py-2.5 text-small border border-border outline-none rounded-button focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="is_available" checked={isAvailable} onCheckedChange={(checked) => setIsAvailable(checked === true)} />
                <label htmlFor="is_available" className="text-small font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">Make this course available for enrollment</label>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-card card-shadow p-6">
            <h2 className="text-h3 text-card-foreground mb-5">Course Media</h2>
            <div onClick={() => thumbnailInputRef.current?.click()} className="border-2 border-dashed border-border rounded-card p-8 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden h-48 group">
              {thumbnailPreview ? <img src={getMediaUrl(thumbnailPreview)} alt="Thumbnail preview" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <><Image size={32} className="text-muted-foreground mb-3 transition-transform group-hover:scale-110" /><p className="text-small font-medium text-foreground">Course Thumbnail</p><p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p></>}
              <input type="file" ref={thumbnailInputRef} className="hidden" accept="image/*" onChange={handleThumbnailChange} />
            </div>
          </div>

          <CourseContentEditor
            sections={sections}
            setSections={setSections}
            addSection={addSection}
            removeSection={removeSection}
            addLesson={addLesson}
            removeLesson={removeLesson}
            handleLessonVideoChange={handleLessonVideoChange}
            onDragEnd={onDragEnd}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-card card-shadow p-6 sticky top-6">
            <h3 className="text-h3 text-card-foreground mb-4">Publish</h3>
            {publishing && (
              <div className="mb-4 p-3 bg-primary/5 rounded-md border border-primary/10 animate-pulse">
                <div className="flex items-center gap-2 text-xs text-primary font-medium mb-1"><Loader2 size={14} className="animate-spin" />Processing...</div>
                <p className="text-[10px] text-muted-foreground italic">{publishProgress}</p>
              </div>
            )}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-small"><span className="text-muted-foreground">Status</span><span className={`font-black ${isAvailable ? "text-emerald-600" : "text-amber-600"}`}>{isAvailable ? "Available" : "Draft"}</span></div>
              <div className="flex justify-between text-small"><span className="text-muted-foreground">Sections</span><span className="font-bold text-foreground">{sections.length}</span></div>
              <div className="flex justify-between text-small"><span className="text-muted-foreground">Lessons</span><span className="font-bold text-foreground">{sections.reduce((a, s) => a + s.lessons.length, 0)}</span></div>
            </div>
            <Button onClick={handlePublish} disabled={publishing} className="w-full gradient-primary border-0 text-primary-foreground font-black rounded-button hover:opacity-90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
              {publishing ? <><Loader2 size={16} className="mr-2 animate-spin" /> Processing...</> : <><Upload size={16} className="mr-2" /> {isEditMode ? "Update Course" : "Publish Course"}</>}
            </Button>
            <div className="mt-6 p-4 bg-muted/50 rounded-card border border-border">
              <h4 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider flex items-center gap-2"><HelpCircle size={14} className="text-primary" /> Instructions</h4>
              <ul className="text-[11px] text-muted-foreground space-y-2 list-disc pl-4">
                <li>Fill all required fields marked in the form.</li>
                <li>Each lesson MUST have a video file.</li>
                <li>Maximum video size: 100MB.</li>
                <li>Drag and drop items to reorder them.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadCourse;
