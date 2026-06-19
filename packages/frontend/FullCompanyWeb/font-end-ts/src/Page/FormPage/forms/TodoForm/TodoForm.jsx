import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

// function TodoForm() {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();



//     return (
//       <form onSubmit={handleSubmit((data) => console.log(data))}>
//         <input {...register('firstName')} />
//         <input {...register('lastName', { required: true })} />
//         {errors.lastName && <p>Last name is required.</p>}
//         <input {...register('age', { pattern: /\d+/ })} />
//         {errors.age && <p>Please enter number for age.</p>}
//         <input type="submit" />
//       </form>
//     );
// }



// "use client"



// const FormSchema = z.object({
//   username: z.string().min(2, {
//     message: "Username must be at least 2 characters.",
//   }),
// })



export function TodoForm() {
  const form = useForm({defaultValues:{
      username:"沈宁"
  }})

  function onSubmit(data) {
    console.log("data");
    console.log(data);
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  // console.log(form);
  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
export default TodoForm;
