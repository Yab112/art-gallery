import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative overflow-hidden px-4 py-20">
      <div className="container relative z-10 mx-auto ">
        <div className="grid items-center gap-12 lg:grid-cols-3">
          <div className="col-span-1 space-y-8">
            <div className="space-y-4">
              <h2 className=" text-3xl text-gray-900 leading-tight lg:text-4xl">
                Discover and Buy
                <br />
                <span className="text-balance">Art that Moves You</span>
              </h2>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
            >
              Discover Artists
            </Button>
          </div>

          {/* Right content - Phone mockups */}
          <div className="relative col-span-2 h-[40vh] bg-red-300 ">
            <img
              src="/cta.webp"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
