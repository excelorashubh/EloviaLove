import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Heart, Shield, Users, Globe, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import BannerAd from '../components/ads/BannerAd';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const About = () => {
  return (
    <div className=" pb-12 overflow-hidden bg-slate-50">
      
        <Navbar />
     
      {/* Hero Header */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute top-0 right-0 w-125 h-125 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute top-0 left-0 w-125 h-125 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/4 -translate-x-1/4" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
              Redefining <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-pink-500">Love</span> in the Digital Age
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We started EloviaLove with a simple belief: finding love shouldn't be exhausting. It should be exciting, authentic, and safe.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop" 
                alt="Happy couple walking" 
                className="rounded-3xl shadow-2xl z-10 relative"
              />
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-primary-200 rounded-3xl z-0" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
                    <Target size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  To create meaningful connections that go beyond screen time. We've built an environment where superficial swiping is replaced by deep, structured discovery.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-pink-100 text-pink-600 rounded-xl">
                    <Globe size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Our Vision</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  A world where technology serves as a bridge, not a barrier, bringing together compatible souls regardless of geography, guided by safety and authenticity.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose EloviaLove</h2>
            <p className="text-lg text-slate-600">The thoughtful approach to digital dating.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Uncompromising Safety", desc: "Military-grade encryption and 100% human-verified profiles ensure you're talking to real people." },
              { icon: Heart, title: "Psychology-Backed Matches", desc: "Our algorithm is designed with behavioral scientists to find true compatibility traits." },
              { icon: Users, title: "Inclusive Community", desc: "A welcoming, troll-free space for everyone looking for a serious, committed relationship." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-slate-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto">
              Passionate romantic-technologists dedicated to your success.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Jessica Chen", role: "CEO & Founder", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop" },
              { name: "Marcus Johnson", role: "Head of Product", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop" },
              { name: "Dr. Elena Rostova", role: "Lead Psychologist", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop" },
              { name: "Alex Rivera", role: "Head of Community safety", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop" }
            ].map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="text-center group"
              >
                <div className="overflow-hidden rounded-full w-48 h-48 mx-auto mb-6 shadow-lg border-4 border-white relative">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">{member.name}</h4>
                <p className="text-primary-600 font-medium">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad — between team and CTA */}
      <div className="py-4 bg-slate-50 flex justify-center">
        <BannerAd slot="2345678901" />
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-linear-to-r from-primary-50 to-pink-50 rounded-[3rem] p-12 lg:p-16 border border-pink-100 shadow-xl shadow-pink-100/50"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Write Your Own Love Story</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
              Our community is waiting for you. Don't let another day pass by without giving true love a chance.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-linear-to-r from-primary-600 to-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-y-1 transition-all duration-300"
            >
              Start Free Trial <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
