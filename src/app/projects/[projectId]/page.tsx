interface Props { 
    params : Promise<{ 
        projectId: string;
    }>
}; 


const Page = async ({ params }: Props) => { 
    const { projectId } = await params;

    return ( 
        <div>
            <h1>Project ID: {projectId}</h1>
            {/* Additional content can be added here */}
        </div>
    ); 
}


export default Page;