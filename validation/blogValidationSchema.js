const { z } = require("zod");

const blogValidationSchema = z.object({
  blog_id: z.string().optional(), // now optional since it will be auto-generated
  title: z.string().min(3, "Title must be at least 3 characters"),
  author_name: z.string().min(2, "Author name must be at least 2 characters"),
  author_profile_url: z.string().url("Invalid URL").optional(),
  thumbnail_image_url: z.string().url("Invalid URL").optional(),
  short_description: z.string().max(500, "Description too long").optional(),
  tags: z.array(z.string()).optional(),
  publish_date: z.preprocess(
    (arg) =>
      typeof arg === "string" || typeof arg === "number" ? new Date(arg) : arg,
    z
      .date()
      .optional()
      .refine((date) => !date || date <= new Date(), {
        message: "Publish date cannot be in the future",
      })
  ),
  share_url: z.string().url("Invalid URL").optional(),
});

module.exports = blogValidationSchema;  


// const { z } = require("zod");

// const blogValidationSchema = z.object({
//   blog_id: z.string().optional(), // now optional since it will be auto-generated
//   title: z.string().min(3, "Title must be at least 3 characters"),
//   author_name: z.string().min(2, "Author name must be at least 2 characters"),
//   author_profile_url: z.string().url("Invalid URL").optional(),
//   thumbnail_image_url: z.string().url("Invalid URL").optional(),
//   short_description: z.string().max(500, "Description too long").optional(),
//   tags: z.array(z.string()).optional(),
//   publish_date: z.preprocess(
//     (arg) =>
//       typeof arg === "string" || typeof arg === "number" ? new Date(arg) : arg,
//     z
//       .date()
//       .optional()
//       .refine((date) => !date || date <= new Date(), {
//         message: "Publish date cannot be in the future",
//       })
//   ),
//   share_url: z.string().url("Invalid URL").optional(),
// });

// module.exports = blogValidationSchema;
