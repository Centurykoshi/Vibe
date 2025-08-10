import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectList } from "@/modules/home/ui/components/projects-list";
import Image from "next/image";


const Page = () => {
  return(
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
      <div className="flex flex-col items-center">
        <Image
          src={"/wired-outline-478-computer-display-hover-angle.gif"}
          alt="Vibe"
          width={70}
          height={70}
          className="hidden md:block"
        />
      </div>

      <h1 className="text-2xl md:text-5xl font-bold text-center">

        Build Something with Vibe 
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground text-center">
            Creating with AI, Build Something with Vibe Coding 
      </p>

        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm />
           </div>
      </section>
      <ProjectList/>

     

    </div>

  )

}

export default Page;