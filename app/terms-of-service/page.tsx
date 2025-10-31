import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { ChevronRight } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <PageLayout>
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="border-border border-b">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-4xl">
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                Terms of Service
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
          <h1 className="mb-2 font-bold text-foreground text-4xl">
            Terms of Service
          </h1>
          <p className="mb-8 text-muted-foreground">
            Last updated: October 2024
          </p>

          <div className="space-y-8 prose-invert max-w-none prose">
            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                1. Agreement to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using this website, you accept and agree to be
                bound by the terms and provision of this agreement. If you do
                not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                2. Use License
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Permission is granted to temporarily download one copy of the
                materials (information or software) on MineHub's website for
                personal, non-commercial transitory viewing only. This is the
                grant of a license, not a transfer of title, and under this
                license you may not:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>Modifying or copying the materials</li>
                <li>
                  Using the materials for any commercial purpose or for any
                  public display
                </li>
                <li>
                  Attempting to decompile or reverse engineer any software
                  contained on the website
                </li>
                <li>
                  Removing any copyright or other proprietary notations from the
                  materials
                </li>
                <li>
                  Transferring the materials to another person or "mirroring"
                  the materials on any other server
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                3. Disclaimer
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The materials on MineHub's website are provided on an 'as is'
                basis. MineHub makes no warranties, expressed or implied, and
                hereby disclaims and negates all other warranties including,
                without limitation, implied warranties or conditions of
                merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property or other violation of
                rights.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                4. Limitations
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall MineHub or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on MineHub's website.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                5. Accuracy of Materials
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The materials appearing on MineHub's website could include
                technical, typographical, or photographic errors. MineHub does
                not warrant that any of the materials on its website are
                accurate, complete, or current. MineHub may make changes to the
                materials contained on its website at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                6. Links
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                MineHub has not reviewed all of the sites linked to its website
                and is not responsible for the contents of any such linked site.
                The inclusion of any link does not imply endorsement by MineHub
                of the site. Use of any such linked website is at the user's own
                risk.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                7. Modifications
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                MineHub may revise these terms of service for its website at any
                time without notice. By using this website, you are agreeing to
                be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-foreground text-2xl">
                8. Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms and conditions are governed by and construed in
                accordance with the laws of the United States, and you
                irrevocably submit to the exclusive jurisdiction of the courts
                in that location.
              </p>
            </section>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
