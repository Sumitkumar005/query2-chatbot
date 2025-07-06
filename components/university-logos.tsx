import Image from "next/image"

export function UniversityLogos() {
  const universities = [
    { name: "FAU", logo: "/placeholder.svg?height=60&width=120" },
    { name: "University of Texas", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Cornell University", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Webster University", logo: "/placeholder.svg?height=60&width=120" },
    { name: "NJIT", logo: "/placeholder.svg?height=60&width=120" },
    { name: "University of Illinois Chicago", logo: "/placeholder.svg?height=60&width=120" },
    { name: "Texas A&M University", logo: "/placeholder.svg?height=60&width=120" },
    { name: "University of Michigan", logo: "/placeholder.svg?height=60&width=120" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-items-center mt-12 opacity-60">
      {universities.map((university, index) => (
        <div key={index} className="grayscale hover:grayscale-0 transition-all duration-300">
          <Image
            src={university.logo || "/placeholder.svg"}
            alt={university.name}
            width={120}
            height={60}
            className="h-12 w-auto object-contain"
          />
        </div>
      ))}
    </div>
  )
}
