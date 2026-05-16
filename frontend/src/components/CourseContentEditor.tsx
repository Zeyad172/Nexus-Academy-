import { Plus, X, Video, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { SectionForm } from "@/lib/courses-api";

interface CourseContentEditorProps {
  sections: SectionForm[];
  setSections: React.Dispatch<React.SetStateAction<SectionForm[]>>;
  addSection: () => void;
  removeSection: (index: number) => void;
  addLesson: (sectionIndex: number) => void;
  removeLesson: (sectionIndex: number, lessonIndex: number) => void;
  handleLessonVideoChange: (sectionIndex: number, lessonIndex: number, file: File) => void;
  onDragEnd: (result: DropResult) => void;
}

const CourseContentEditor = ({
  sections,
  setSections,
  addSection,
  removeSection,
  addLesson,
  removeLesson,
  handleLessonVideoChange,
  onDragEnd,
}: CourseContentEditorProps) => {
  return (
    <div className="bg-card rounded-card card-shadow p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-h3 text-card-foreground">Course Content</h2>
        <Button variant="outline" size="sm" className="rounded-button hover:bg-primary/5 transition-colors" onClick={addSection}>
          <Plus size={14} className="mr-1" /> Add Section
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {sections.map((section, si) => (
                <Draggable key={`section-${si}`} draggableId={`section-${si}`} index={si}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="border border-border rounded-lg p-4 bg-muted/20 transition-all hover:bg-muted/30 relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div {...provided.dragHandleProps} className="text-muted-foreground hover:text-primary cursor-grab active:cursor-grabbing">
                          <GripVertical size={18} />
                        </div>
                        <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{si + 1}</div>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            const u = [...sections];
                            u[si].title = e.target.value;
                            setSections(u);
                          }}
                          placeholder="Section title"
                          className="flex-1 px-3 py-1.5 text-small bg-background rounded-button border border-border outline-none focus:ring-2 focus:ring-primary/20 font-medium transition-all"
                        />
                        <button onClick={() => removeSection(si)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                          <X size={16} />
                        </button>
                      </div>

                      <Droppable droppableId={`lessons-${si}`} type="lesson">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 ml-6 min-h-[10px]">
                            {section.lessons.map((lesson, li) => (
                              <Draggable key={`lesson-${si}-${li}`} draggableId={`lesson-${si}-${li}`} index={li}>
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} className="bg-background border border-border rounded-md p-3 space-y-3 transition-all hover:shadow-sm group">
                                    <div className="flex items-center gap-2">
                                      <div {...provided.dragHandleProps} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                        <GripVertical size={14} />
                                      </div>
                                      <span className="text-xs font-medium text-muted-foreground">L{li + 1}</span>
                                      <input
                                        type="text"
                                        value={lesson.title}
                                        onChange={(e) => {
                                          const u = [...sections];
                                          u[si].lessons[li].title = e.target.value;
                                          setSections(u);
                                        }}
                                        placeholder="Lesson title"
                                        className="flex-1 px-3 py-1 text-small bg-muted/50 rounded-button border-0 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                      />
                                      <button onClick={() => removeLesson(si, li)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                                        <X size={14} />
                                      </button>
                                    </div>
                                    <textarea
                                      value={lesson.description}
                                      onChange={(e) => {
                                        const u = [...sections];
                                        u[si].lessons[li].description = e.target.value;
                                        setSections(u);
                                      }}
                                      placeholder="Lesson description (optional)"
                                      rows={2}
                                      className="w-full px-3 py-1.5 text-xs bg-muted/30 rounded-button border-0 outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                                    />
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1">
                                        <input
                                          type="file"
                                          accept="video/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleLessonVideoChange(si, li, file);
                                          }}
                                          className="hidden"
                                          id={`video-${si}-${li}`}
                                        />
                                        <label htmlFor={`video-${si}-${li}`} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-button border border-primary/20 cursor-pointer hover:bg-primary/20 transition-all w-fit">
                                          <Video size={14} />
                                          {lesson.video ? lesson.video.name : (lesson.video_url ? "Change Lesson Video" : "Upload Lesson Video")}
                                        </label>
                                        {lesson.video_url && !lesson.video && <span className="ml-2 text-[10px] text-emerald-600 font-medium">Video Uploaded</span>}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            <button onClick={() => addLesson(si)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mt-1 transition-all hover:pl-1">
                              <Plus size={12} /> Add Lesson
                            </button>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CourseContentEditor;
