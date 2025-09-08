import Image from 'next/image';

type Item = {
  title: string;
  body: string;
  imgSrc: string;
  imgAlt?: string;
};

interface ValuesRowProps {
  items: Item[];
}

export default function ValuesRow({ items }: ValuesRowProps) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-3 md:divide-x md:divide-gray-200">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center p-8 md:p-10"
            >
              {/* Illustration */}
              <div className="h-36 w-auto flex items-center justify-center">
                <Image
                  src={item.imgSrc}
                  alt={item.imgAlt ?? ""}
                  width={160}
                  height={160}
                  className="h-36 w-auto object-contain"
                  priority={false}
                />
              </div>

              {/* Headline */}
              <h3 className="mt-6 font-heading font-black uppercase tracking-[-0.01em] text-2xl text-gray-900" style={{ fontFamily: 'Tubi Sans Variable, Poppins, sans-serif' }}>
                {item.title}
              </h3>

              {/* Body */}
              <p className="mt-4 font-body text-base text-gray-900/80 leading-relaxed max-w-prose">
                {item.body}
              </p>

              {/* Gradient underline */}
              <div className="absolute bottom-0 left-8 right-8 h-[3px] rounded-full bg-gradient-to-r from-[#8C00E5] to-[#45009D]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
