import { DiningFeature, DiningMenuItem, HomeHeroItem, LuxuryFeature, LuxuryGalleryImage, Prisma, PrismaClient, TheaterEvent } from '@prisma/client';
import { GraphQLScalarType, Kind } from 'graphql';

const prisma = new PrismaClient();

type ResolverQueryArgs = {
    theaterId: string
    movieId: string
    showtimeId: string
    screenId: string
    currentDate: string
}

type CreateTheaterArgs = {
    name: string 
    address: string
    city: string
    state: string
    zipCode: string 
    phoneNumber: string
    openTime: string
    closeTime: string
    standard: boolean
    imax: boolean
    screenX: boolean
    dolby: boolean
    latitude: string
    longitude: string
}

type CreateMovieArgs = {
    title: string       
    description: string  
    runtime: string      
    rating: string       
    releaseDate: string
    poster: string       
    trailer: string
    nowPlaying: boolean
    limitedRelease: boolean
}

type CreateFormatArgs = {
    type: string
}

type CreateScreenArgs = {
    theaterId: string
    formatId: string
    number: number
}

type CreateShowtimeArgs = {
    theaterId: string
    movieId: string
    screenId: string
    time: Date
    price: number
}

type SeatInput = {
    screenId: string
    showtimeId: string
    name: string
    available: boolean
    accessability: boolean
}

type CreateTestimonialArgs = {
    text: string
    author: string
}

type CreateHomeFeatureItem = {
    title: string
    subtitle: string
    background: string
    size: string
}

type CreateMembershipPerk = {
    text: string
}

type CreateAppFeature = {
    text: string
}

type CreateHomeHeroItem = {
    title: string
    subtitle: string
    buttonText: string
    background: string
    link: string
    movieTitle?: string
}

type Seat = {
    id: string
    screen: Screen
    name: String
    available: Boolean
    accessability: Boolean
}

type CreateTicketInput = {
    showtimeId: string
    price: number
    seatIds: string[]
    email: string
}

const DateTime = new GraphQLScalarType({
    name: 'DateTime',
    description: 'Custom scalar type for DateTime',
    parseValue(value: unknown) {
      // Use a type assertion to let TypeScript know the value should be a string or number
      if (typeof value === 'string' || typeof value === 'number') {
        return new Date(value); // value from the client
      }
      throw new Error("Invalid value for DateTime");
    },
    serialize(value: unknown) {
      // Again, assert that value is a Date instance
      if (value instanceof Date) {
        return value.getTime(); // value sent to the client
      }
      throw new Error("Value is not a Date");
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value); // ast value is always in string format
      }
      throw new Error("Invalid literal for DateTime");
    },
});

type ShowtimeWithRelations = Prisma.ShowtimeGetPayload<{
    include: { Theater: true, Seat: true, Screen: { include: { Format: true }} };
}>;

type ScreenWithFormat = Prisma.ScreenGetPayload<{
    include: { Format: true };
}>;


const resolvers = {
    DateTime,
    Showtime: {
        theater: (parent: ShowtimeWithRelations) => parent.Theater,
        seats: (parent: ShowtimeWithRelations) => parent.Seat,
        screen: (parent: ShowtimeWithRelations) => parent.Screen,
    },
    Screen: {
        format: (parent: ScreenWithFormat) => parent.Format,
    },
    Query: {
      theaters: async () => {
          return await prisma.theater.findMany()
      },
      allShowtimes: async () => {
          const showtimes = await prisma.showtime.findMany({
            include: { Theater: true, Movie: true, Screen: { include: { Format: true } } }
          })
          return showtimes
      },
      showtimesByTheater: async (_: any, { theaterId }: ResolverQueryArgs) => {
          return await prisma.showtime.findMany({
              where: { theaterId: parseInt(theaterId) },
              include: { Theater: true, Movie: true, Screen: { include: { Format: true } } }
          })
      },
      showtimesByMovie: async (_: any, { movieId, currentDate }: ResolverQueryArgs) => {
          const showtimes = await prisma.showtime.findMany({
              where: { 
                movieId: parseInt(movieId), 
                time: {
                    gte: new Date(`${currentDate}T00:00:00Z`), // Start of the day
                    lt: new Date(`${currentDate}T23:59:59Z`), // End of the day
                  },
               },
              include: { Theater: true, Seat: true, Screen: { include: { Format: true } } }
          })

          return showtimes
      },
      allMovies: async () => {
          return await prisma.movie.findMany()
      },
      nowPlayingMovies: async () => {
          return await prisma.movie.findMany({
              where: { nowPlaying: true, limitedRelease: false}
          })
      },
      comingSoonMovies: async () => {
        return await prisma.movie.findMany({
            where: { nowPlaying: false}
        })
      },
      limitedReleaseMovies: async () => {
        return await prisma.movie.findMany({
            where: { limitedRelease: true, nowPlaying: true}
        })
      },
      allScreens: async () => {
          return await prisma.screen.findMany({
              include: { Theater: true, Format: true },
          });
      },
      screenByShowtime: async (_: any, { showtimeId }: ResolverQueryArgs) => {
          const showtime = await prisma.showtime.findUnique({
              where: { id: parseInt(showtimeId) },
              include: { Screen: true }
          })

          return showtime ? showtime.Screen : null
      },
      allFormats: async () => {
          return await prisma.format.findMany()
      },
      formatByScreen: async(_: any, { screenId }: ResolverQueryArgs) => {
          const screen = await prisma.screen.findUnique({
              where: { id: parseInt(screenId) },
              include: { Format: true }
          })

          return screen
      },
      allSeats: async () => {
          return await prisma.seat.findMany()
      },
      seatsByShowtime: async(_: any, { showtimeId }: ResolverQueryArgs) => {
          return await prisma.seat.findMany({
              where: { showtimeId: parseInt(showtimeId)}
          })
      },
      allTestimonials: async () => {
        return await prisma.testimonial.findMany()
      },
      homeFeatureItems: async () => {
        return await prisma.homeFeatureItem.findMany()
      },
      membershipPerks: async () => {
        return await prisma.membershipPerk.findMany()
      },
      appFeatures: async () => {
        return await prisma.appFeature.findMany()
      },
      homeHeroItems: async () => {
        return await prisma.homeHeroItem.findMany()
      },
      diningFeatures: async () => {
        return await prisma.diningFeature.findMany()
      },
      diningMenuItems: async () => {
        return await prisma.diningMenuItem.findMany()
      },
      eventFeatures: async () => {
        return await prisma.eventFeature.findMany()
      },
      theaterEvents: async () => {
        return await prisma.theaterEvent.findMany()
      },
      luxuryFeatures: async () => {
        return await prisma.luxuryFeature.findMany()
      },
      luxuryGalleryImages: async () => {
        return await prisma.luxuryGalleryImage.findMany()
      }
    },
    Mutation: {
      createTheater: async(_: any, { name, address, city, state, zipCode, phoneNumber, openTime, closeTime, standard, imax, screenX, dolby }: CreateTheaterArgs) => {
          try {    
              // Create the new theater
              const newTheater = await prisma.theater.create({
                data: {
                  name,
                  address,
                  city,
                  state,
                  zipCode,
                  phoneNumber,
                  openTime: openTime,
                  closeTime: closeTime,
                  standard,
                  imax,
                  screenX,
                  dolby
                },
              });
            
              return newTheater;
            } catch (error: any) {
              throw new Error("Error creating theater: " + error.message);
            }
      },

      createMovie: async(_: any, { title, description, runtime, rating, releaseDate, poster, trailer, nowPlaying}: CreateMovieArgs) => {
          try {
              const newMovie = await prisma.movie.create({
                  data: {
                      title,
                      description,
                      runtime,
                      rating,
                      releaseDate,
                      poster,
                      trailer,
                      nowPlaying
                  }
              });

              return newMovie;
          } catch (error: any) {
              throw new Error("Error creating movie: " + error.message)
          }
      },

      createFormat: async(_: any, { type }: CreateFormatArgs) => {
          try {
              const newFormat = await prisma.format.create({
                  data: {
                      type
                  }
              });

              return newFormat
          } catch (error: any) {
              throw new Error("Error creating format " + error.message)
          }
      },

      createScreen: async(_: any, {theaterId, formatId, number}: CreateScreenArgs) => {
          try {
              // Fetch the theater
              const theater = await prisma.theater.findUnique({
                where: { id: parseInt(theaterId) },
                select: { standard: true, imax: true, screenX: true, dolby: true }
              });

              // Check if theater exists
              if (!theater) {
                throw new Error(`Theater with ID ${theaterId} not found.`);
              }

              // Check if the format is allowed for this theater
              const format = await prisma.format.findUnique({ where: { id: parseInt(formatId) } });

              // Check if format exists
              if (!format) {
                  throw new Error(`Format with ID ${formatId} not found.`);
              }

              const formatAllowed = 
                  (format.type === 'Standard' && theater.standard) ||
                  (format.type === 'IMAX' && theater.imax) ||
                  (format.type === 'ScreenX' && theater.screenX) ||
                  (format.type === 'Dolby' && theater.dolby)

              if (!formatAllowed) {
                throw new Error(`Theater does not support the ${format.type} format.`);
              }

              const newScreen = await prisma.screen.create({
                  data: {
                      Theater: { connect: { id: parseInt(theaterId) } },
                      Format: { connect: { id: parseInt(formatId) } },
                      number
                  }
              });

              return newScreen
          } catch (error: any) {
              throw new Error("Error creating screen " + error.message)
          }
      },

      createShowtime: async (_: any, { theaterId, movieId, screenId, time, price}: CreateShowtimeArgs) => {
          try {
              // Fetch the theater
          const theater = await prisma.theater.findUnique({
              where: { id: parseInt(theaterId) }
          });

          // Check if theater exists
          if (!theater) {
              throw new Error(`Theater with ID ${theaterId} not found.`);
          }

          // Fetch the movie
          const movie = await prisma.movie.findUnique({
              where: { id: parseInt(movieId) }
          });

          // Check if movie exists
          if (!movie) {
              throw new Error(`Movie with ID ${movieId} not found`);
          }

          // Fetch the screen
          const screen = await prisma.screen.findUnique({
              where: { id: parseInt(screenId) }
          });

          // Check if screen exists
          if (!screen) {
              throw new Error(`Screen with ID ${screenId} not found`);
          }

          const newShowtime = await prisma.showtime.create({
              data: {
                  Theater: { connect: { id: parseInt(theaterId) } },
                  Movie: { connect: { id: parseInt(movieId) } },
                  Screen: { connect: { id: parseInt(screenId) } },
                  time: new Date(time),
                  price
              }
          });

          return newShowtime
          } catch (error: any) {
              throw new Error("Error creating showtime " + error.message)
          }
      },

      createSeats: async (_: any, { seats } : { seats: SeatInput[] } ) => {
        // Confirm seats is an array
        if (!Array.isArray(seats)) {
            throw new Error("The seats input is not an array");
        }

        const seatData = seats.map(seat => ({
          screenId: parseInt(seat.screenId),
          showtimeId: parseInt(seat.showtimeId),
          name: seat.name,
          available: seat.available,
          accessability: seat.accessability,
        }));
  
        await prisma.seat.createMany({
          data: seatData,
          skipDuplicates: true, // Optional: Skips duplicates if you want to avoid errors on conflict
        });

        // Fetch the created seats to return them
        const createdSeats = await prisma.seat.findMany({
          where: {
            OR: seatData.map(seat => ({
              screenId: seat.screenId,
              showtimeId: seat.showtimeId,
              name: seat.name,
            })),
          },
        });

        return createdSeats;
      },

      createTestimonial: async(_: any, { text, author }: CreateTestimonialArgs ) => {
        try {
            const newTestimonial = await prisma.testimonial.create({
                data: {
                    text,
                    author
                }
            })

            return newTestimonial
        } catch(error: any) {
            throw new Error("Error creating theater: " + error.message);
        }
      },

      createHomeFeatureItem: async(_: any, { title, subtitle, background, size}: CreateHomeFeatureItem ) => {
        try {
            const newHomeFeatureItem = await prisma.homeFeatureItem.create({
                data: {
                    title,
                    subtitle,
                    background,
                    size
                }
            })

            return newHomeFeatureItem
        } catch (error: any) {
            console.log(error)
        }
      },

      createMembershipPerk: async(_: any, { text }: CreateMembershipPerk ) => {
        try {
            const newMembershipPerk = await prisma.membershipPerk.create({
                data: {
                    text
                }
            })

            return newMembershipPerk
        } catch (error: any) {
            console.log(error)
        }
      },

      createAppFeature: async(_: any, { text }: CreateAppFeature ) => {
        try {
            const newAppFeature = await prisma.appFeature.create({
                data: {
                    text
                }
            })

            return newAppFeature
        } catch (error: any) {
            console.log(error)
        }
      },

      createHomeHeroItem: async(_: any, { title, subtitle, buttonText, background, link, movieTitle = ""}: CreateHomeHeroItem) => {
        try {
            const newHomeHeroItem = await prisma.homeHeroItem.create({
                data: {
                    title,
                    subtitle, 
                    buttonText,
                    background,
                    link, 
                    movieTitle
                }
            })

            return newHomeHeroItem
        } catch (error: any) {
            console.log(error)
        }
      },

      createDiningFeature: async(_: any, { title, description }: DiningFeature) => {
        try {
            const newDiningFeature = await prisma.diningFeature.create({
                data: {
                    title,
                    description
                }
            })

            return newDiningFeature
        } catch (error: any) {
            console.log(error)
        }
      },

      createDiningMenuItem: async(_: any, { item, description, price, calories, category, background }: DiningMenuItem) => {
        try {
            const newDiningMenuItem = await prisma.diningMenuItem.create({
                data: {
                    item,
                    description,
                    price,
                    calories,
                    category,
                    background
                }
            })

            return newDiningMenuItem
        } catch (error: any) {
            console.log(error)
        }
      },

      createEventFeature: async(_: any, { title, description }: DiningFeature) => {
        try {
            const newEventFeature = await prisma.eventFeature.create({
                data: {
                    title,
                    description
                }
            })

            return newEventFeature
        } catch (error: any) {
            console.log(error)
        }
      },

      createTheaterEvent: async(_: any, { title, subtitle, description, date, location, specialEvent, bookingPhrase, background }: TheaterEvent) => {
        try {
            const newEvent = await prisma.theaterEvent.create({
                data: {
                    title,
                    subtitle,
                    description,
                    date,
                    location,
                    specialEvent,
                    bookingPhrase,
                    background
                }
            })

            return newEvent
        } catch (error: any) {
            console.log(error)
        }
      },

      createLuxuryFeature: async(_: any, { title, description }: LuxuryFeature) => {
        try {
            const newLuxuryFeature = await prisma.luxuryFeature.create({
                data: {
                    title,
                    description
                }
            })

            return newLuxuryFeature
        } catch (error: any) {
            console.log(error)
        }
      },

      createLuxuryGalleryImage: async(_: any, { url, label, size }: LuxuryGalleryImage) => {
        try {
            const newLuxuryImage = await prisma.luxuryGalleryImage.create({
                data: {
                    url,
                    label,
                    size
                }
            })

            return newLuxuryImage
        } catch (error: any) {
            console.log(error)
        }
      },

      createTicket: async (_: any, { showtimeId, price, seatIds, email }: CreateTicketInput) => {
        try {
            const numericSeatIds = seatIds.map((seatId) => Number(seatId));
            const newTicket = await prisma.ticket.create({
                data: {
                    showtimeId: Number(showtimeId),
                    price,
                    Seat: {
                        connect: numericSeatIds.map(seatId => ({ id: seatId })), // Connecting existing seats by their IDs
                    },
                    email: email
                }
            })

            await prisma.seat.updateMany({
                where: {
                    id: { in: numericSeatIds }, // Only update the seats that are associated with the ticket
                },
                data: {
                    ticketId: newTicket.id,
                    available: false,  // Set the available field to false
                }
            })
    
            return newTicket
        } catch (error: any) {
            console.log(error)
        }
      }
    }
};

export default resolvers;

// mutation {
//     createTheater(
//       name: "TheaterX Midtown",
//       address: "1385 Peachtree way",
//       city: "Atlanta",
//       state: "GA",
//       zipCode: "30308",
//       phoneNumber: "111-222-3333",
//       openTime: "10:00 AM",
//       closeTime: "2:00 AM",
//       standard: true,
//       imax: true,
//       screenX: true,
//       dolby: true
//     ) {
//       id
//     }
//   }

// createShowtime(
//     theaterId: ID!
//     movieId: ID!
//     time: DateTime
//     price: Float
//     screenId: ID
// )

// npx prisma migrate dev
// npx prisma generate

// mutation {
//     createTheater(
//       name: "TheaterX Tamiami",
//       address: "5982 Tamiami Ln",
//       city: "Miami",
//       state: "FL",
//       zipCode: "33175",
//       phoneNumber: "3786-167-9911",
//       openTime: "10:00 AM",
//       closeTime: "12:00 AM",
//       standard: true,
//       imax: true,
//       screenX: false,
//       dolby: false
//     ) {
//       id
//     }
//   }

// query Theaters {
//   theaters {
//     id,
//     name,
//     standard,
//     imax,
//     screenX,
//     dolby
//   }
// }

// mutation  {
//   createMovie(
//     title: "Creed III"        
//     description: "Still dominating the boxing world, Adonis Creed is thriving in his career and family life. When Damian, a childhood friend and former boxing prodigy resurfaces after serving time in prison, he's eager to prove that he deserves his shot in the ring."  
//     runtime: "1 HR 56 MIN"     
//     rating: "PG-13"       
//     releaseDate: "March 3rd, 2023"
//     poster: ""       
//     trailer: "https://www.youtube.com/watch?v=AHmCH7iB_IM"
//     nowPlaying: true
//   ) {
//     id
//   }
// }

// query Movies {
//   allMovies {
//     title
//   }
// }

// mutation {
//   createFormat(
//     type: "Dolby"
//   ) {
//     id
//   }
// }

// query Formats {
//   allFormats {
//     type
//   }
// }

// mutation {
//   createScreen(
//     theaterId: "5",
//     formatId: "1",
//     number: 10
//   ) {
//     id,
//     number
//   }
// }

// query Screens {
//   allScreens {
//     number
//     theater {
//       name
//     },
//     format {
//       type
//     }
//   }
// }

// mutation {
//   createShowtime(
//     theaterId: 1
//     movieId: 5
//     time: "2024-11-01T00:00:00Z" # Date and time in ISO format
//     price: 15.00
//     screenId: 55
//   ) {
//     id
//   }
// }

// query {
//   showtimesByTheater(theaterId: 1) {
//     time
//     theater {
//       name
//     }
//     movie {
//       title
//     },
//     screen {
//       number,
//       format {
//         type
//       }
//     }
//   }
// }

// # IMAX Screen
// mutation {
//   createSeats(seats: [
//     { screenId: 1, showtimeId: 8, name: "A1", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A2", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A3", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A4", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A5", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A6", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A7", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A8", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A9", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A10", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A11", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A12", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A13", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A14", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A15", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A16", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A17", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A18", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A19", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A20", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "A21", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B1", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B2", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B3", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B4", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B5", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B6", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B7", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B8", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B9", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B10", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B11", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B12", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B13", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B14", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B15", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B16", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B17", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B18", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B19", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B20", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B21", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B22", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B23", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B24", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B25", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "B26", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C1", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C2", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C3", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C4", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C5", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C6", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C7", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C8", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C9", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C10", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C11", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C12", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C13", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C14", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C15", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C16", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C17", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C18", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C19", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C20", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C21", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C22", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C23", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C24", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C25", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C26", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "C27", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D1", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D2", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D3", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D4", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D5", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D6", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D7", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D8", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D9", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D10", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D11", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D12", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D13", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D14", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D15", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D16", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D17", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D18", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D19", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D20", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D21", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D22", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D23", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D24", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D25", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D26", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D27", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "D28", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E1", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E2", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E3", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E4", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E5", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E6", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E7", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E8", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E9", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E10", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E11", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E12", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E13", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E14", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E15", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E16", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E17", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E18", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E19", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E20", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E21", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E22", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E23", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E24", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E25", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E26", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E27", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "E28", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F1", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F2", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F3", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F4", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F5", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F6", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F7", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F8", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F9", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F10", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F11", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F12", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F13", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F14", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F15", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F16", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F17", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F18", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F19", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F20", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F21", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F22", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F23", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F24", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F25", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F26", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F27", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F28", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F29", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "F30", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G1", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G2", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G3", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G4", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G5", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G6", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G7", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G8", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G9", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G10", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G11", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G12", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G13", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G14", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G15", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G16", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G17", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G18", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G19", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G20", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G21", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G22", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G23", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G24", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G25", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G26", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G27", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G28", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G29", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "G30", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H1", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H2", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H3", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H4", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H5", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H6", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H7", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H8", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H9", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H10", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H11", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H12", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H13", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H14", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H15", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H16", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H17", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H18", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H19", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H20", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H21", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H22", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H23", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H24", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H25", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H26", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H27", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H28", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H29", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H30", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "H31", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I1", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I2", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I3", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I4", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I5", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I6", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I7", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I8", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I9", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I10", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I11", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I12", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I13", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I14", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I15", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I16", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I17", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I18", available: true, accessability: false },
//     { screenId: 1, showtimeId: 8, name: "I19", available: true, accessability: true },
//     { screenId: 1, showtimeId: 8, name: "I20", available: true, accessability: true },
//     { screenId: 1, showtimeId: 8, name: "I21", available: true, accessability: true },
//     { screenId: 1, showtimeId: 8, name: "I22", available: true, accessability: true },
//     { screenId: 1, showtimeId: 8, name: "I23", available: true, accessability: true },
//     { screenId: 1, showtimeId: 8, name: "I24", available: true, accessability: true },
//     { screenId: 1, showtimeId: 8, name: "I25", available: true, accessability: true },
//     { screenId: 1, showtimeId: 8, name: "I26", available: true, accessability: true },
//     { screenId: 1, showtimeId: 8, name: "I27", available: true, accessability: true },
//     { screenId: 1, showtimeId: 8, name: "I28", available: true, accessability: true }
//   ]) {
//     id
//     name
//     available
//   }
// }

// # Small Screen
// mutation {
//   createSeats(seats: [
//     { screenId: 55, showtimeId: 50, name: "A1", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "A2", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "A3", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "A4", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "A5", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "A6", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "A7", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "A8", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "A9", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "A10", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "A11", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "A12", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "A13", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B1", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B2", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B3", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B4", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B5", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B6", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B7", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B8", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B9", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B10", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B11", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B12", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "B13", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "C1", available: true, accessability: true },
//     { screenId: 55, showtimeId: 50, name: "C2", available: true, accessability: true },
//     { screenId: 55, showtimeId: 50, name: "C3", available: true, accessability: true },
//     { screenId: 55, showtimeId: 50, name: "C4", available: true, accessability: true },
//     { screenId: 55, showtimeId: 50, name: "C5", available: true, accessability: true },
//     { screenId: 55, showtimeId: 50, name: "C6", available: true, accessability: true },
//     { screenId: 55, showtimeId: 50, name: "C7", available: true, accessability: true },
//     { screenId: 55, showtimeId: 50, name: "C8", available: true, accessability: true },
//     { screenId: 55, showtimeId: 50, name: "C9", available: true, accessability: true },
//     { screenId: 55, showtimeId: 50, name: "C10", available: true, accessability: true },
//     { screenId: 55, showtimeId: 50, name: "D1", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "D2", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "D3", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "D4", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "D5", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "D6", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "D7", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "D8", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "D9", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "D10", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "D11", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "D12", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "E1", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "E2", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "E3", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "E4", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "E5", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "E6", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "E7", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "E8", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "E9", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "E10", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "E11", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "E12", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "F1", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "F2", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "F3", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "F4", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "F5", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "F6", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "F7", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "F8", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "F9", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "F10", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "F11", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "F12", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "G1", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "G2", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "G3", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "G4", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "G5", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "G6", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "G7", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "G8", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "G9", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "G10", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "G11", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "G12", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "H1", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "H2", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "H3", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "H4", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "H5", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "H6", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "H7", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "H8", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "H9", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "H10", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "H11", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "H12", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I1", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I2", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I3", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I4", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I5", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I6", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I7", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I8", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I9", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I10", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I11", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I12", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I13", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I14", available: true, accessability: false },
//     { screenId: 55, showtimeId: 50, name: "I15", available: true, accessability: false }
//   ]) {
//     id
//     name
//     available
//   }
// }

// # Standard Screen
// mutation {
//   createSeats(seats: [
//     { screenId: 8, showtimeId: 25, name: "A1", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A2", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A3", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A4", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A5", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A6", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A7", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A8", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A9", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A10", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A11", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A12", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A13", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A14", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A15", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A16", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A17", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A18", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A19", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "A20", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B1", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B2", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B3", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B4", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B5", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B6", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B7", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B8", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B9", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B10", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B11", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B12", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B13", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B14", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B15", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B16", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B17", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B18", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B19", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "B20", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C1", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C2", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C3", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C4", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C5", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C6", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C7", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C8", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C9", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C10", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C11", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C12", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C13", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C14", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C15", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C16", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C17", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C18", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C19", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "C20", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "D1", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D2", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D3", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D4", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D5", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D6", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D7", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D8", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D9", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D10", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D11", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D12", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D13", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D14", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D15", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "D16", available: true, accessability: true },
//     { screenId: 8, showtimeId: 25, name: "E1", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E2", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E3", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E4", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E5", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E6", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E7", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E8", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E9", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E10", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E11", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E12", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E13", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E14", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E15", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "E16", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F1", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F2", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F3", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F4", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F5", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F6", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F7", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F8", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F9", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F10", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F11", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F12", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F13", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F14", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F15", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "F16", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G1", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G2", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G3", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G4", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G5", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G6", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G7", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G8", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G9", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G10", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G11", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G12", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G13", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G14", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G15", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "G16", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H1", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H2", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H3", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H4", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H5", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H6", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H7", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H8", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H9", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H10", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H11", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H12", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H13", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H14", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H15", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H16", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H17", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H18", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H19", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "H20", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I1", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I2", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I3", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I4", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I5", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I6", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I7", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I8", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I9", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I10", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I11", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I12", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I13", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I14", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I15", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I16", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I17", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I18", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I19", available: true, accessability: false },
//     { screenId: 8, showtimeId: 25, name: "I20", available: true, accessability: false },
//   ]) {
//     id
//     name
//     available
//   }
// }

// # ScreenX
// mutation {
//   createSeats(seats: [
//     { screenId: 4, showtimeId: 52, name: "A1", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A2", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A3", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A4", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A5", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A6", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A7", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A8", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A9", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A10", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A11", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A12", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A13", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A14", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "A15", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B1", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B2", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B3", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B4", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B5", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B6", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B7", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B8", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B9", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B10", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B11", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B12", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B13", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B14", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "B15", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C1", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C2", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C3", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C4", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C5", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C6", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C7", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C8", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C9", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C10", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C11", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C12", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C13", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C14", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "C15", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D1", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D2", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D3", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D4", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D5", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D6", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D7", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D8", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D9", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D10", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D11", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D12", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D13", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D14", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "D15", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E1", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E2", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E3", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E4", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E5", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E6", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E7", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E8", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E9", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E10", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E11", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E12", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E13", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E14", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "E15", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F1", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F2", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F3", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F4", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F5", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F6", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F7", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F8", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F9", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F10", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F11", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F12", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F13", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F14", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "F15", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G1", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G2", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G3", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G4", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G5", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G6", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G7", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G8", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G9", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G10", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G11", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G12", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G13", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G14", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "G15", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H1", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H2", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H3", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H4", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H5", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H6", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H7", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H8", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H9", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H10", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H11", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H12", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H13", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H14", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "H15", available: true, accessability: false },
//     { screenId: 4, showtimeId: 52, name: "I1", available: true, accessability: true },
//     { screenId: 4, showtimeId: 52, name: "I2", available: true, accessability: true },
//     { screenId: 4, showtimeId: 52, name: "I3", available: true, accessability: true },
//     { screenId: 4, showtimeId: 52, name: "I4", available: true, accessability: true },
//     { screenId: 4, showtimeId: 52, name: "I5", available: true, accessability: true },
//     { screenId: 4, showtimeId: 52, name: "I6", available: true, accessability: true },
//     { screenId: 4, showtimeId: 52, name: "I7", available: true, accessability: true },
//     { screenId: 4, showtimeId: 52, name: "I8", available: true, accessability: true },
//     { screenId: 4, showtimeId: 52, name: "I9", available: true, accessability: true },
//     { screenId: 4, showtimeId: 52, name: "I10", available: true, accessability: true },
//     { screenId: 4, showtimeId: 52, name: "I11", available: true, accessability: true },
//     { screenId: 4, showtimeId: 52, name: "I12", available: true, accessability: true },
//   ]) {
//     id
//     name
//     available
//   }
// }

// # Dolby
// mutation {
//   createSeats(seats: [
//     { screenId: 5, showtimeId: 54, name: "A1", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A2", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A3", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A4", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A5", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A6", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A7", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A8", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A9", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A10", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A11", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A12", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A13", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A14", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A15", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A16", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "A17", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B1", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B2", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B3", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B4", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B5", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B6", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B7", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B8", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B9", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B10", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B11", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B12", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B13", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B14", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B15", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B16", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B17", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B18", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B19", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B20", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B21", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "B22", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C1", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C2", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C3", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C4", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C5", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C6", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C7", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C8", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C9", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C10", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C11", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C12", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C13", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C14", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C15", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C16", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C17", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C18", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C19", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C20", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C21", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C22", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "C23", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D1", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D2", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D3", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D4", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D5", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D6", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D7", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D8", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D9", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D10", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D11", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D12", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D13", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D14", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D15", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D16", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D17", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D18", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D19", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D20", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D21", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D22", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D23", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "D24", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E1", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E2", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E3", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E4", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E5", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E6", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E7", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E8", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E9", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E10", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E11", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E12", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E13", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E14", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E15", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E16", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E17", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E18", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E19", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E20", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E21", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E22", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E23", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "E24", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F1", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F2", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F3", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F4", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F5", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F6", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F7", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F8", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F9", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F10", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F11", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F12", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F13", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F14", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F15", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F16", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F17", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F18", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F19", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F20", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F21", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F22", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F23", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F24", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F25", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "F26", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G1", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G2", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G3", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G4", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G5", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G6", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G7", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G8", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G9", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G10", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G11", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G12", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G13", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G14", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G15", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G16", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G17", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G18", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G19", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G20", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G21", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G22", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G23", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G24", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G25", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "G26", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H1", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H2", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H3", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H4", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H5", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H6", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H7", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H8", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H9", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H10", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H11", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H12", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H13", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H14", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H15", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H16", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H17", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H18", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H19", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H20", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H21", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H22", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H23", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H24", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H25", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H26", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "H27", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I1", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I2", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I3", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I4", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I5", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I6", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I7", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I8", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I9", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I10", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I11", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I12", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I13", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I14", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I15", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I16", available: true, accessability: false },
//     { screenId: 5, showtimeId: 54, name: "I19", available: true, accessability: true },
//     { screenId: 5, showtimeId: 54, name: "I20", available: true, accessability: true },
//     { screenId: 5, showtimeId: 54, name: "I21", available: true, accessability: true },
//     { screenId: 5, showtimeId: 54, name: "I22", available: true, accessability: true },
//     { screenId: 5, showtimeId: 54, name: "I23", available: true, accessability: true },
//     { screenId: 5, showtimeId: 54, name: "I24", available: true, accessability: true },
//     { screenId: 5, showtimeId: 54, name: "I25", available: true, accessability: true },
//     { screenId: 5, showtimeId: 54, name: "I26", available: true, accessability: true }
//   ]) {
//     id
//     name
//     available
//   }
// }